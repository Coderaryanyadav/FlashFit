// Error logging utility using console for now (can be replaced with Sentry later)

interface ErrorLog {
    message: string;
    stack?: string;
    context?: any;
    timestamp: Date;
    userId?: string;
    page?: string;
}

class ErrorLogger {
    private static instance: ErrorLogger;
    private errors: ErrorLog[] = [];

    private constructor() { }

    static getInstance(): ErrorLogger {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }

    log(error: Error | string, context?: any) {
        const errorLog: ErrorLog = {
            message: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'string' ? undefined : error.stack,
            context,
            timestamp: new Date(),
            page: typeof window !== 'undefined' ? window.location.pathname : undefined
        };

        this.errors.push(errorLog);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('🔴 Error logged:', errorLog);
        }

        // In production, send to error tracking service (Sentry, LogRocket, etc.)
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to Sentry or similar service
            // Sentry.captureException(error, { extra: context });
        }

        // Keep only last 100 errors in memory
        if (this.errors.length > 100) {
            this.errors.shift();
        }
    }

    getErrors(): ErrorLog[] {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
    }
}

export const errorLogger = ErrorLogger.getInstance();

// Helper function for async error handling
export async function withErrorLogging<T>(
    fn: () => Promise<T>,
    context?: any
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        errorLogger.log(error as Error, context);
        return null;
    }
}
