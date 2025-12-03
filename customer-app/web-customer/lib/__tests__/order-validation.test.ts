import { validateOrderRequest, validatePincode, validateLocation, validateAddress, validateItems, validateTotalAmount } from '../order-validation';
import { ORDER_LIMITS } from '@/config/business-rules';

describe('Order Validation', () => {
    describe('validatePincode', () => {
        it('should accept valid serviceable pincode', () => {
            expect(() => validatePincode('400059')).not.toThrow();
        });

        it('should reject invalid pincode', () => {
            expect(() => validatePincode('999999')).toThrow('we don\'t deliver to pincode');
        });

        it('should reject non-string pincode', () => {
            expect(() => validatePincode(null as any)).toThrow('Invalid pincode format');
        });
    });

    describe('validateLocation', () => {
        it('should accept location within Mumbai bounds', () => {
            expect(() => validateLocation(19.1, 72.8)).not.toThrow();
        });

        it('should reject location outside bounds', () => {
            expect(() => validateLocation(51.5, -0.1)).toThrow('outside our service area');
        });
    });

    describe('validateItems', () => {
        it('should accept valid items', () => {
            const items = [
                { id: '1', title: 'Test', price: 100, quantity: 2 }
            ];
            expect(() => validateItems(items)).not.toThrow();
        });

        it('should reject empty items array', () => {
            expect(() => validateItems([])).toThrow('at least one item');
        });

        it('should reject too many items', () => {
            const items = Array(51).fill({ id: '1', title: 'Test', price: 100, quantity: 1 });
            expect(() => validateItems(items)).toThrow('cannot contain more than');
        });

        it('should reject invalid quantity', () => {
            const items = [{ id: '1', title: 'Test', price: 100, quantity: 11 }];
            expect(() => validateItems(items)).toThrow('quantity must be between');
        });

        it('should reject negative price', () => {
            const items = [{ id: '1', title: 'Test', price: -100, quantity: 1 }];
            expect(() => validateItems(items)).toThrow('cannot be negative');
        });
    });

    describe('validateTotalAmount', () => {
        const items = [
            { id: '1', title: 'Test', price: 100, quantity: 2 }
        ];

        it('should accept valid total', () => {
            expect(() => validateTotalAmount(200, items)).not.toThrow();
        });

        it('should reject amount below minimum', () => {
            expect(() => validateTotalAmount(50, items)).toThrow('Minimum order amount');
        });

        it('should reject amount above maximum', () => {
            expect(() => validateTotalAmount(600000, items)).toThrow('Maximum order amount');
        });

        it('should reject mismatched total', () => {
            expect(() => validateTotalAmount(300, items)).toThrow('does not match sum');
        });
    });

    describe('validateAddress', () => {
        const validAddress = {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400059',
            location: { lat: 19.1, lng: 72.8 }
        };

        it('should accept valid address', () => {
            expect(() => validateAddress(validAddress)).not.toThrow();
        });

        it('should reject XSS attempts', () => {
            const xssAddress = { ...validAddress, street: '<script>alert("xss")</script>' };
            expect(() => validateAddress(xssAddress)).toThrow('Invalid characters');
        });

        it('should reject too long fields', () => {
            const longAddress = { ...validAddress, street: 'a'.repeat(201) };
            expect(() => validateAddress(longAddress)).toThrow('too long');
        });
    });
});
