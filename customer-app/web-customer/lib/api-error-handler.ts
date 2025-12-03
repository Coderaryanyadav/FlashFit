import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}
