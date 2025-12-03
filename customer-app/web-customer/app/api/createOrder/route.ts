import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/utils/firebaseAdmin';
import { handleApiError } from '@/lib/api-error-handler';
import { UnauthorizedError } from '@/lib/errors';
import { validateOrderRequest, type OrderRequest } from '@/lib/order-validation';
import { executeOrderTransaction } from '@/lib/order-transaction';
import { findNearestDriver, assignDriverToOrder } from '@/lib/driver-assignment';

async function verifyAuthToken(authHeader: string | null) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing token');
    }

    const token = authHeader.split('Bearer ')[1];
    const adminAuth = getAdminAuth();

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);

        if (!decodedToken.email_verified) {
            throw new UnauthorizedError('Please verify your email before placing an order');
        }

        return decodedToken;
    } catch (e) {
        console.error('Token verification failed:', e);
        throw new UnauthorizedError('Invalid token');
    }
}

export async function POST(request: Request) {
    try {
        // 1. Verify authentication
        const authHeader = request.headers.get('Authorization');
        const decodedToken = await verifyAuthToken(authHeader);

        // 2. Parse and validate request
        const body = await request.json();
        const orderData: OrderRequest = {
            items: body.items,
            address: body.address,
            storeId: body.storeId,
            totalAmount: body.totalAmount,
            userId: body.userId
        };

        // 3. Verify user ID matches token
        if (orderData.userId !== decodedToken.uid) {
            throw new UnauthorizedError('User ID mismatch');
        }

        // 4. Validate order data
        validateOrderRequest(orderData);

        // 5. Execute transaction
        const db = getAdminDb();
        const orderId = await executeOrderTransaction(db, orderData, decodedToken.uid);

        // 6. Assign driver (async, don't block response)
        findNearestDriver(db, orderData.address.location.lat, orderData.address.location.lng)
            .then(driverId => {
                if (driverId) {
                    return assignDriverToOrder(db, orderId, driverId);
                }
            })
            .catch(err => console.error('Driver assignment failed:', err));

        // 7. Return success
        return NextResponse.json({
            success: true,
            orderId,
            message: 'Order placed successfully'
        }, { status: 201 });

    } catch (error) {
        return handleApiError(error);
    }
}
