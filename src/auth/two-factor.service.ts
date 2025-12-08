import { Injectable, Logger } from '@nestjs/common';

interface OTPRecord {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private otpStore: Map<string, OTPRecord> = new Map();

  // Generate a 6-digit code
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP for a user
  async createOTP(email: string): Promise<string> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    this.otpStore.set(email, {
      code,
      email,
      expiresAt,
      attempts: 0,
    });

    this.logger.log(`OTP created for ${email}: ${code}`);
    return code;
  }

  // Verify OTP
  verifyOTP(email: string, code: string): { valid: boolean; message: string } {
    const record = this.otpStore.get(email);

    if (!record) {
      return { valid: false, message: 'No se encontró código de verificación' };
    }

    // Check if expired
    if (new Date() > record.expiresAt) {
      this.otpStore.delete(email);
      return { valid: false, message: 'El código ha expirado' };
    }

    // Check attempts
    if (record.attempts >= 3) {
      this.otpStore.delete(email);
      return { valid: false, message: 'Demasiados intentos. Solicita un nuevo código' };
    }

    // Verify code
    if (record.code !== code) {
      record.attempts++;
      return { valid: false, message: `Código incorrecto. Intentos restantes: ${3 - record.attempts}` };
    }

    // Success - remove the OTP
    this.otpStore.delete(email);
    return { valid: true, message: 'Código verificado correctamente' };
  }

  // Send OTP via email (using Supabase or fallback to console log)
  async sendOTPEmail(email: string, code: string): Promise<boolean> {
    try {
      // For now, we'll just log the code
      // In production, you would integrate with an email service like SendGrid, Mailgun, or Supabase Email
      this.logger.log(`
        ========================================
        🔐 CÓDIGO DE VERIFICACIÓN 2FA
        ========================================
        Email: ${email}
        Código: ${code}
        Expira en: 5 minutos
        ========================================
      `);
      
      // TODO: Implement actual email sending
      // Example with nodemailer or another service:
      // await this.emailService.send({
      //   to: email,
      //   subject: 'Código de verificación - TecnoSports Admin',
      //   html: `<p>Tu código de verificación es: <strong>${code}</strong></p>`,
      // });

      return true;
    } catch (error) {
      this.logger.error(`Error sending OTP email: ${error}`);
      return false;
    }
  }

  // Clean expired OTPs
  cleanExpiredOTPs() {
    const now = new Date();
    for (const [email, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }
}
