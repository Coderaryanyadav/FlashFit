import { AppError, ValidationError, UnauthorizedError, StockError } from '../errors';

describe('API Error Handler Logic', () => {
    describe('Error Classification', () => {
        it('should create AppError with correct properties', () => {
            const error = new AppError('Test error', 400, 'TEST_ERROR');

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('TEST_ERROR');
        });

        it('should create ValidationError with 400 status', () => {
            const error = new ValidationError('Invalid input');

            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('VALIDATION_ERROR');
        });

        it('should create UnauthorizedError with 401 status', () => {
            const error = new UnauthorizedError();

            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('UNAUTHORIZED');
        });

        it('should create StockError with 400 status', () => {
            const error = new StockError('Out of stock');

            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('INSUFFICIENT_STOCK');
        });

        it('should handle error inheritance correctly', () => {
            const error = new ValidationError('Test');

            expect(error instanceof AppError).toBe(true);
            expect(error instanceof Error).toBe(true);
        });
    });
});
