/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseGuard } from './supabase.guard';
import { CreateUserDto } from 'src/api/users/dto/create-user.dto';
import { found, ok } from 'src/Utils/Responses';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: CreateUserDto) {
    return ok(await this.authService.signUp(body));
  }

  @Post('signin')
  async signIn(@Body() body: { email: string; password: string }) {
    const result = await this.authService.signIn(body.email, body.password);

    // Try to get user profile from database
    try {
      const userProfile = await this.authService.getUserProfile(result.user.id);
      return {
        ...result,
        userProfile: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          roleId: userProfile.roleId,
        },
      };
    } catch (error) {
      console.log('User not in database, returning default profile');
      // User not in database, return default profile
      return {
        ...result,
        userProfile: {
          id: result.user.id,
          email: result.user.email,
          name:
            result.user.user_metadata?.name ||
            (result.user.email ? result.user.email.split('@')[0] : 'Usuario'),
          roleId: 3, // Default role
        },
      };
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(SupabaseGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return found(
      'Profile',
      await this.authService.getUserProfile(req.user.authUserId),
    );
  }

  @UseGuards(SupabaseGuard)
  @Post('signout')
  async signOut() {
    return this.authService.signOut();
  }
}
