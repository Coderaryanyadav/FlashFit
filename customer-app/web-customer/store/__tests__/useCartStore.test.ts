import { useCartStore } from '../useCartStore';

describe('Cart Store', () => {
    beforeEach(() => {
        useCartStore.setState({ items: [] });
    });

    describe('addItem', () => {
        it('should add item to empty cart', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg',
                stock: 10
            };

            useCartStore.getState().addItem(product);

            const items = useCartStore.getState().items;
            expect(items).toHaveLength(1);
            expect(items[0].id).toBe('1');
            expect(items[0].quantity).toBe(1);
        });

        it('should increment quantity for existing item', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg',
                stock: 10
            };

            useCartStore.getState().addItem(product);
            useCartStore.getState().addItem(product);

            const items = useCartStore.getState().items;
            expect(items).toHaveLength(1);
            expect(items[0].quantity).toBe(2);
        });

        it('should not add more than 50 items total', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg',
                stock: 100
            };

            useCartStore.getState().addItem(product, '', 50);
            useCartStore.getState().addItem(product, '', 1);

            const items = useCartStore.getState().items;
            expect(items[0].quantity).toBe(50);
        });
    });

    describe('total calculation', () => {
        it('should calculate correct total', () => {
            const product1 = {
                id: '1',
                title: 'Product 1',
                price: 100,
                category: 'Test',
                image: 'test.jpg',
                stock: 10
            };

            const product2 = {
                id: '2',
                title: 'Product 2',
                price: 200,
                category: 'Test',
                image: 'test.jpg',
                stock: 10
            };

            useCartStore.getState().addItem(product1, '', 2);
            useCartStore.getState().addItem(product2, '', 1);

            const total = useCartStore.getState().total();
            expect(total).toBe(400); // (100 * 2) + (200 * 1)
        });
    });

    describe('removeItem', () => {
        it('should remove item from cart', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg',
                stock: 10
            };

            useCartStore.getState().addItem(product);
            useCartStore.getState().removeItem('1');

            const items = useCartStore.getState().items;
            expect(items).toHaveLength(0);
        });
    });
});
