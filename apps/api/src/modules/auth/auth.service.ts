import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { OtpStore, OtpStoreDocument } from './schemas/otp-store.schema.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import type { Response } from 'express';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(OtpStore.name) private otpModel: Model<OtpStoreDocument>,
    private jwtService: JwtService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const phone = this.normalizePhone(dto.phone);

    // Check resend cooldown
    const existing = await this.otpModel.findOne({ phone });
    if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - existing.createdAt.getTime())) / 1000,
      );
      throw new BadRequestException(`Wait ${wait}s before resending OTP`);
    }

    const otp = this.generateOtp();
    await this.otpModel.findOneAndUpdate(
      { phone },
      { phone, otp, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true },
    );

    if (process.env.PRETEND_MODE === 'true') {
      console.log(`[PRETEND OTP] Phone: ${phone} | OTP: ${otp}`);
    }
    // Real SMS/WhatsApp provider would be called here

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto, res: Response) {
    const phone = this.normalizePhone(dto.phone);
    const record = await this.otpModel.findOne({ phone });

    if (!record) throw new UnauthorizedException('OTP not found or expired');
    if (Date.now() - record.createdAt.getTime() > OTP_TTL_MS) {
      await this.otpModel.deleteOne({ phone });
      throw new UnauthorizedException('OTP expired');
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException('Too many attempts, request a new OTP');
    }

    if (record.otp !== dto.otp) {
      await this.otpModel.updateOne({ phone }, { $inc: { attempts: 1 } });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.otpModel.deleteOne({ phone });

    // Find or create user
    let user = await this.userModel.findOne({ phone });
    if (!user) {
      // First login — create owner (first user ever becomes owner)
      const count = await this.userModel.countDocuments();
      user = await this.userModel.create({
        phone,
        name: 'Owner',
        role: count === 0 ? 'owner' : 'member',
        isActive: true,
      });
    }

    const payload = { sub: user._id.toString(), phone: user.phone, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    return { user: { id: user._id, phone: user.phone, role: user.role, name: user.name } };
  }

  logout(res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizePhone(phone: string): string {
    // Normalize to E.164-ish: strip spaces, ensure 10-digit Indian numbers get +91
    let p = phone.replace(/\s/g, '');
    if (p.length === 10 && !p.startsWith('+')) p = `+91${p}`;
    return p;
  }
}
