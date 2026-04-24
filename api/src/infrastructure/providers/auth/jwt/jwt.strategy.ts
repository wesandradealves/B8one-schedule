import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';
import { UserEntity } from '@/domain/entities/user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

interface AccessTokenPayload {
  sub: string;
  email: string;
  profile: AuthenticatedUser['profile'];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    const secret = configService.get<string>('auth.jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    if (!payload.sub || !payload.email || !payload.profile) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: payload.sub })
      .getOne();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is inactive or no longer available');
    }

    const normalizedPayloadEmail = payload.email.trim().toLowerCase();
    const normalizedUserEmail = user.email.trim().toLowerCase();
    if (normalizedUserEmail !== normalizedPayloadEmail || user.profile !== payload.profile) {
      throw new UnauthorizedException('Token is no longer valid');
    }

    return {
      id: payload.sub,
      email: payload.email,
      profile: payload.profile,
    };
  }
}
