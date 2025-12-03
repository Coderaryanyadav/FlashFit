import { AppError, ValidationError, UnauthorizedError, StockError } from '../errors';

describe('Custom Error Classes', () => {
    describe('AppError', () => {
        it('should create error with message and status code', () => {
            const error = new AppError('Test error', 400, 'TEST_ERROR');

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('TEST_ERROR');
            expect(error.name).toBe('AppError');
        });
    });

    describe('ValidationError', () => {
        it('should create validation error with 400 status', () => {
            const error = new ValidationError('Invalid input');

            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('UnauthorizedError', () => {
        it('should create unauthorized error with 401 status', () => {
            const error = new UnauthorizedError();

            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('UNAUTHORIZED');
        });
    });

    describe('StockError', () => {
        it('should create stock error with 400 status', () => {
            const error = new StockError('Out of stock');

            expect(error.message).toBe('Out of stock');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('INSUFFICIENT_STOCK');
        });
    });
});
