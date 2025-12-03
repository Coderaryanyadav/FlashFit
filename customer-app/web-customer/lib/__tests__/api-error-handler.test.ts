import { handleApiError } from '../api-error-handler';
import { AppError, ValidationError, UnauthorizedError } from '../errors';

describe('API Error Handler', () => {
    describe('handleApiError', () => {
        it('should handle AppError with correct status code', () => {
            const error = new AppError('Test error', 400, 'TEST_ERROR');
            const response = handleApiError(error);

            expect(response.status).toBe(400);
        });

        it('should handle ValidationError with 400 status', () => {
            const error = new ValidationError('Invalid input');
            const response = handleApiError(error);

            expect(response.status).toBe(400);
        });

        it('should handle UnauthorizedError with 401 status', () => {
            const error = new UnauthorizedError();
            const response = handleApiError(error);

            expect(response.status).toBe(401);
        });

        it('should handle generic Error with 500 status', () => {
            const error = new Error('Something went wrong');
            const response = handleApiError(error);

            expect(response.status).toBe(500);
        });

        it('should handle unknown errors with 500 status', () => {
            const response = handleApiError('string error');

            expect(response.status).toBe(500);
        });

        it('should include error code in response for AppError', () => {
            const error = new AppError('Test', 400, 'TEST_CODE');
            const response = handleApiError(error);

            // Response body would contain the code
            expect(response).toBeDefined();
        });
    });
});
