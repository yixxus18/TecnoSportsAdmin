/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard extends AuthGuard('jwt') implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private supabaseService: SupabaseService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No bearer token found');
    }

    const token = authHeader.split(' ')[1];
    this.logger.debug(`Token received: ${token.substring(0, 20)}...`);

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error) {
        this.logger.error(`Supabase auth error: ${error.message}`);
        throw new UnauthorizedException('Invalid or expired token');
      }
      
      if (!data.user) {
        this.logger.error('No user returned from Supabase');
        throw new UnauthorizedException('Invalid or expired token');
      }

      this.logger.debug(`User authenticated: ${data.user.email}`);
      request.user = data.user; // Attach user information to the request
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Authentication failed: ${errorMessage}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

