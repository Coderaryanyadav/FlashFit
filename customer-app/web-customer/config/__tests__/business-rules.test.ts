import { ORDER_LIMITS, DELIVERY_ZONES } from '../business-rules';

describe('Business Rules Config', () => {
    describe('ORDER_LIMITS', () => {
        it('should have correct max items limit', () => {
            expect(ORDER_LIMITS.MAX_ITEMS_PER_ORDER).toBe(50);
        });

        it('should have correct amount limits', () => {
            expect(ORDER_LIMITS.MAX_ORDER_AMOUNT).toBe(500_000);
            expect(ORDER_LIMITS.MIN_ORDER_AMOUNT).toBe(100);
        });
    });

    describe('DELIVERY_ZONES', () => {
        it('should have Mumbai Goregaon pincodes', () => {
            const pincodes = DELIVERY_ZONES.MUMBAI_GOREGAON.pincodes;
            expect(pincodes).toContain('400059');
            expect(pincodes).toHaveLength(10);
        });

        it('should have valid coordinate bounds', () => {
            const bounds = DELIVERY_ZONES.MUMBAI_GOREGAON.bounds;
            expect(bounds.lat.min).toBeLessThan(bounds.lat.max);
            expect(bounds.lng.min).toBeLessThan(bounds.lng.max);
        });
    });
});
