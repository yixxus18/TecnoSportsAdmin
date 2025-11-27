/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Req, Res } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import type { Response } from 'express';

@Controller('/')
export class HomeController {
  constructor(private readonly supabaseService: SupabaseService) {}

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }
    const queryToken = request.query?.token;
    if (queryToken) {
      return queryToken;
    }
    const cookieToken = request.cookies?.authToken;
    if (cookieToken) {
      return cookieToken;
    }
    return undefined;
  }

  @Get()
  async root(@Req() req, @Res() res: Response) {
    const token = this.extractTokenFromHeader(req);

    if (!token) {
      return res.redirect('/admin/login');
    }

    try {
      const { data: user, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error || !user?.user) {
        return res.redirect('/admin/login');
      }

      return res.render('pages/home/index.hbs', {
        layout: 'main',
        hideHeader: true,
      });
    } catch (error) {
      return res.redirect('/admin/login');
    }
  }
}
