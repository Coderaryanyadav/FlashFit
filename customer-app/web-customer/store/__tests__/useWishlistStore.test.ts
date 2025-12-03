import { useWishlistStore } from '../useWishlistStore';

describe('Wishlist Store', () => {
    beforeEach(() => {
        useWishlistStore.setState({ items: [] });
    });

    describe('addItem', () => {
        it('should add item to wishlist', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);

            const items = useWishlistStore.getState().items;
            expect(items).toHaveLength(1);
            expect(items[0].id).toBe('1');
        });

        it('should not add duplicate items', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);
            useWishlistStore.getState().addItem(product);

            const items = useWishlistStore.getState().items;
            expect(items).toHaveLength(1);
        });
    });

    describe('removeItem', () => {
        it('should remove item from wishlist', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);
            useWishlistStore.getState().removeItem('1');

            const items = useWishlistStore.getState().items;
            expect(items).toHaveLength(0);
        });
    });

    describe('isInWishlist', () => {
        it('should return true for items in wishlist', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                category: 'Test',
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);

            expect(useWishlistStore.getState().isInWishlist('1')).toBe(true);
        });

        it('should return false for items not in wishlist', () => {
            expect(useWishlistStore.getState().isInWishlist('999')).toBe(false);
        });
    });

    describe('clearWishlist', () => {
        it('should remove all items', () => {
            const product1 = { id: '1', title: 'Product 1', price: 100, category: 'Test', image: 'test.jpg' };
            const product2 = { id: '2', title: 'Product 2', price: 200, category: 'Test', image: 'test.jpg' };

            useWishlistStore.getState().addItem(product1);
            useWishlistStore.getState().addItem(product2);
            useWishlistStore.getState().clearWishlist();

            const items = useWishlistStore.getState().items;
            expect(items).toHaveLength(0);
        });
    });
});
