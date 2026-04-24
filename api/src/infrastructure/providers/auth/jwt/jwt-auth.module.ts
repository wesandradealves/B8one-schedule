import { IJwtProvider } from '@/domain/interfaces/providers/jwt.provider';
import { UserEntity } from '@/domain/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtProvider } from './jwt.provider';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<number>('auth.jwt.expiresInSeconds'),
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: IJwtProvider,
      useClass: JwtProvider,
    },
  ],
  exports: [IJwtProvider, PassportModule, JwtModule],
})
export class JwtAuthModule {}
