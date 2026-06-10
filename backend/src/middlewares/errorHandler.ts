import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../utils/errors';

export function errorHandler(
    error: FastifyError | AppError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Handle known AppError (operational errors)
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
        });
    }

    // Handle Fastify validation errors
    if ((error as any).validation) {
        return reply.status(400).send({
            success: false,
            message: 'Validation Error',
            details: (error as any).validation,
        });
    }

    // Fallback to generic error
    const statusCode = (error as any).statusCode || 500;
    request.log.error(error);

    reply.status(statusCode).send({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
}
