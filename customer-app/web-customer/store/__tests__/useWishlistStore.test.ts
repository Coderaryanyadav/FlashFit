// Mock Firebase completely to avoid auth issues
jest.mock('@/utils/firebase', () => ({
    db: {},
    auth: {
        currentUser: null,
        onAuthStateChanged: jest.fn()
    }
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
    onSnapshot: jest.fn()
}));

jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn((auth, callback) => {
        // Don't call callback to avoid triggering the listener
        return jest.fn(); // Return unsubscribe function
    })
}));

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
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);

            const items = useWishlistStore.getState().items;
            expect(items).toHaveLength(1);
            expect(items[0].id).toBe('1');
        });
    });

    describe('removeItem', () => {
        it('should remove item from wishlist', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);
            useWishlistStore.getState().removeItem('1');

            const items = useWishlistStore.getState().items;
            expect(items).toHaveLength(0);
        });
    });

    describe('toggleItem', () => {
        it('should add item if not in wishlist', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                image: 'test.jpg'
            };

            useWishlistStore.getState().toggleItem(product);

            expect(useWishlistStore.getState().isInWishlist('1')).toBe(true);
        });

        it('should remove item if already in wishlist', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);
            useWishlistStore.getState().toggleItem(product);

            expect(useWishlistStore.getState().isInWishlist('1')).toBe(false);
        });
    });

    describe('isInWishlist', () => {
        it('should return true for items in wishlist', () => {
            const product = {
                id: '1',
                title: 'Test Product',
                price: 100,
                image: 'test.jpg'
            };

            useWishlistStore.getState().addItem(product);

            expect(useWishlistStore.getState().isInWishlist('1')).toBe(true);
        });

        it('should return false for items not in wishlist', () => {
            expect(useWishlistStore.getState().isInWishlist('999')).toBe(false);
        });
    });
});
