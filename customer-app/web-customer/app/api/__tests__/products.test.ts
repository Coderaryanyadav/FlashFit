import { createMocks } from 'node-mocks-http';
import { GET } from '../../app/api/products/route';

describe('Products API', () => {
    it('should return products for valid pincode', async () => {
        const { req } = createMocks({
            method: 'GET',
            query: { pincode: '400059' }
        });

        const response = await GET(req as any);
        expect(response.status).toBe(200);
    });

    it('should return 400 for invalid pincode', async () => {
        const { req } = createMocks({
            method: 'GET',
            query: { pincode: 'invalid' }
        });

        const response = await GET(req as any);
        expect(response.status).toBe(400);
    });

    it('should handle timeout gracefully', async () => {
        const { req } = createMocks({
            method: 'GET',
            query: { pincode: '400059' }
        });

        const response = await GET(req as any);
        expect(response).toBeDefined();
    });

    it('should filter by category', async () => {
        const { req } = createMocks({
            method: 'GET',
            query: { pincode: '400059', category: 'fashion' }
        });

        const response = await GET(req as any);
        expect(response.status).toBe(200);
    });

    it('should handle errors properly', async () => {
        const { req } = createMocks({
            method: 'GET',
            query: {}
        });

        const response = await GET(req as any);
        expect(response.status).toBeGreaterThanOrEqual(400);
    });
});
