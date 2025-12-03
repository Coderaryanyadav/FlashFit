# Repository Pattern Implementation

## Product Repository

```typescript
// repositories/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByPincode(pincode: string): Promise<Product[]>;
  findTrending(limit: number): Promise<Product[]>;
  save(product: Product): Promise<void>;
  update(id: string, data: Partial<Product>): Promise<void>;
  delete(id: string): Promise<void>;
}

// repositories/FirestoreProductRepository.ts
import { getAdminDb } from '@/utils/firebaseAdmin';
import type { IProductRepository } from './IProductRepository';

export class FirestoreProductRepository implements IProductRepository {
  private db = getAdminDb();

  async findById(id: string): Promise<Product | null> {
    const doc = await this.db.collection('products').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Product;
  }

  async findByPincode(pincode: string): Promise<Product[]> {
    const snapshot = await this.db
      .collection('products')
      .where('serviceablePincodes', 'array-contains', pincode)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  }

  // ... other methods
}
```

## Order Repository

```typescript
// repositories/IOrderRepository.ts
export interface IOrderRepository {
  create(order: CreateOrderDTO): Promise<string>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}

// repositories/FirestoreOrderRepository.ts
export class FirestoreOrderRepository implements IOrderRepository {
  private db = getAdminDb();

  async create(orderData: CreateOrderDTO): Promise<string> {
    const orderRef = this.db.collection('orders').doc();
    await orderRef.set({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return orderRef.id;
  }

  // ... other methods
}
```

## Usage in Services

```typescript
// services/productService.ts (refactored)
import { FirestoreProductRepository } from '@/repositories/FirestoreProductRepository';

const productRepo = new FirestoreProductRepository();

export async function getProductById(id: string) {
  return await productRepo.findById(id);
}

export async function getProductsByPincode(pincode: string) {
  return await productRepo.findByPincode(pincode);
}
```

## Benefits
- ✅ Abstraction from database implementation
- ✅ Easier testing with mock repositories
- ✅ Cleaner service layer
- ✅ Follows SOLID principles
