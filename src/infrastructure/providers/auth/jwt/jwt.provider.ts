import { IJwtProvider } from '@/domain/interfaces/providers/jwt.provider';
import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtProvider implements IJwtProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signAccessToken(user: AuthenticatedUser): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      profile: user.profile,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.jwt.secret'),
      expiresIn: this.configService.get<number>('auth.jwt.expiresInSeconds'),
    });
  }
}
