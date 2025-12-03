import type { Firestore, Transaction } from 'firebase-admin/firestore';
import { StockError } from './errors';
import type { OrderRequest } from './order-validation';

const TRANSACTION_TIMEOUT = 25000; // 25 seconds

export async function executeOrderTransaction(
    db: Firestore,
    orderData: OrderRequest,
    userId: string
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Transaction timeout - order creation took too long'));
        }, TRANSACTION_TIMEOUT);

        db.runTransaction(async (transaction: Transaction) => {
            try {
                // 1. Read all products first (Firestore requirement)
                const productReads = await Promise.all(
                    orderData.items.map(item =>
                        transaction.get(db.collection('products').doc(item.id))
                    )
                );

                // 2. Validate stock and prices
                const validatedItems = [];
                for (let i = 0; i < orderData.items.length; i++) {
                    const item = orderData.items[i];
                    const productDoc = productReads[i];

                    if (!productDoc.exists) {
                        throw new StockError(`Product ${item.title} is no longer available`);
                    }

                    const productData = productDoc.data()!;
                    const actualPrice = productData.price || 0;

                    // Exact price match (zero tolerance)
                    if (item.price !== actualPrice) {
                        throw new Error(
                            `Price mismatch for ${productData.title}. Expected: ₹${actualPrice}, Received: ₹${item.price}`
                        );
                    }

                    // Check stock
                    let availableStock = 0;
                    if (typeof productData.stock === 'number') {
                        availableStock = productData.stock;
                    } else if (item.size && productData.stock?.[item.size]) {
                        availableStock = productData.stock[item.size];
                    }

                    if (availableStock < item.quantity) {
                        throw new StockError(
                            `Insufficient stock for ${productData.title}. Available: ${availableStock}, Requested: ${item.quantity}`
                        );
                    }

                    validatedItems.push({
                        ...item,
                        price: actualPrice, // Use server price
                        availableStock,
                        productData
                    });
                }

                // 3. Create order document
                const orderRef = db.collection('orders').doc();
                const orderDoc = {
                    userId,
                    items: validatedItems.map(({ productData, availableStock, ...item }) => item),
                    address: orderData.address,
                    storeId: orderData.storeId,
                    totalAmount: validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    status: 'pending',
                    paymentStatus: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                transaction.set(orderRef, orderDoc);

                // 4. Update stock (writes after reads)
                for (const item of validatedItems) {
                    const productRef = db.collection('products').doc(item.id);

                    if (typeof item.productData.stock === 'number') {
                        transaction.update(productRef, {
                            stock: item.productData.stock - item.quantity
                        });
                    } else if (item.size) {
                        transaction.update(productRef, {
                            [`stock.${item.size}`]: item.productData.stock[item.size] - item.quantity
                        });
                    }
                }

                clearTimeout(timeoutId);
                return orderRef.id;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        })
            .then(orderId => resolve(orderId))
            .catch(error => reject(error));
    });
}
