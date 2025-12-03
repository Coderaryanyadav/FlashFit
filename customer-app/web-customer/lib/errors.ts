export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class StockError extends AppError {
    constructor(message: string) {
        super(message, 400, 'INSUFFICIENT_STOCK');
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}
