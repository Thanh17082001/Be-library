import {ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger} from '@nestjs/common';
import {Request, Response} from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('Exception caught in filter');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let message = '';
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = (exceptionResponse as {message: string}).message;
    }
    // Ghi log chi tiết lỗi
    this.logger.error(`Error: ${exception.message}, Status: ${status}, Path: ${request.url} }`);
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: status === 500 ? 'Server Error' : message, // Including the message in the response
      errorDetails: process.env.NODE_ENV === 'development' ? exception.stack.split('\n') || '' : '',
    });
  }
}
