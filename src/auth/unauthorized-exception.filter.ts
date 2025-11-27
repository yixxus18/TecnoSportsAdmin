import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.path.startsWith('/auth') || request.path.startsWith('/api')) {
      response.status(401).json({
        statusCode: 401,
        message: exception.message || 'Unauthorized',
        error: 'Unauthorized',
      });
    } else {
      response.redirect('/admin/login');
    }
  }
}
