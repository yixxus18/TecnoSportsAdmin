/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseGuard } from './supabase.guard';
import { CreateUserDto } from 'src/api/users/dto/create-user.dto';
import { found, ok } from 'src/Utils/Responses';
import { TwoFactorService } from './two-factor.service';

// Temporary storage for pending 2FA sessions
const pending2FASessions = new Map<string, { session: any; userProfile: any; expiresAt: Date }>();

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
  ) {}

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

  // Admin login with 2FA - Step 1: Authenticate and send OTP
  @Post('admin/login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    const result = await this.authService.signIn(body.email, body.password);
    
    // Get user profile
    let userProfile;
    try {
      userProfile = await this.authService.getUserProfile(result.user.id);
    } catch {
      throw new BadRequestException('Usuario no encontrado en el sistema');
    }

    // Check if user is admin (roleId === 2)
    if (userProfile.roleId !== 2) {
      throw new BadRequestException('No tienes permisos de administrador');
    }

    // Generate and send OTP
    const code = await this.twoFactorService.createOTP(body.email);
    await this.twoFactorService.sendOTPEmail(body.email, code);

    // Store session temporarily (expires in 5 minutes)
    pending2FASessions.set(body.email, {
      session: result,
      userProfile: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        roleId: userProfile.roleId,
      },
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return {
      requiresOTP: true,
      message: 'Código de verificación enviado a tu correo electrónico',
      email: body.email,
    };
  }

  // Admin login with 2FA - Step 2: Verify OTP
  @Post('admin/verify-otp')
  async verifyAdminOTP(@Body() body: { email: string; code: string }) {
    const verification = this.twoFactorService.verifyOTP(body.email, body.code);
    
    if (!verification.valid) {
      throw new BadRequestException(verification.message);
    }

    // Get pending session
    const pendingSession = pending2FASessions.get(body.email);
    if (!pendingSession) {
      throw new BadRequestException('Sesión expirada, por favor inicia sesión nuevamente');
    }

    // Check if session expired
    if (new Date() > pendingSession.expiresAt) {
      pending2FASessions.delete(body.email);
      throw new BadRequestException('Sesión expirada, por favor inicia sesión nuevamente');
    }

    // Clear pending session
    pending2FASessions.delete(body.email);

    // Return full session data
    return {
      ...pendingSession.session,
      userProfile: pendingSession.userProfile,
      verified: true,
    };
  }

  // Resend OTP
  @Post('admin/resend-otp')
  async resendOTP(@Body() body: { email: string }) {
    const pendingSession = pending2FASessions.get(body.email);
    if (!pendingSession) {
      throw new BadRequestException('No hay sesión pendiente, por favor inicia sesión nuevamente');
    }

    // Generate new OTP
    const code = await this.twoFactorService.createOTP(body.email);
    await this.twoFactorService.sendOTPEmail(body.email, code);

    // Extend session expiry
    pendingSession.expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    return {
      message: 'Nuevo código de verificación enviado',
    };
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

