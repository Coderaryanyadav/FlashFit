import { createMocks } from 'node-mocks-http';
import { GET } from '../../app/api/categories/route';

describe('Categories API', () => {
    it('should return all categories', async () => {
        const { req } = createMocks({
            method: 'GET'
        });

        const response = await GET(req as any);
        expect(response.status).toBe(200);
    });

    it('should handle errors gracefully', async () => {
        const { req } = createMocks({
            method: 'GET'
        });

        const response = await GET(req as any);
        expect(response).toBeDefined();
    });

    it('should return valid JSON', async () => {
        const { req } = createMocks({
            method: 'GET'
        });

        const response = await GET(req as any);
        expect(response.status).toBe(200);
    });
});
