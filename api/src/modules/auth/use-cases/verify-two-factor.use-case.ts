import {
  IVerifyTwoFactorUseCase,
  VerifyTwoFactorUseCaseInput,
  VerifyTwoFactorUseCaseOutput,
} from '@/domain/interfaces/use-cases/auth/verify-two-factor.use-case';
import { IAuthRepository } from '@/domain/interfaces/repositories/auth.repository';
import { IUserRepository } from '@/domain/interfaces/repositories/user.repository';
import { IJwtProvider } from '@/domain/interfaces/providers/jwt.provider';
import { IMessagingProvider } from '@/domain/interfaces/providers/messaging.provider';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VerifyTwoFactorUseCase implements IVerifyTwoFactorUseCase {
  private readonly logger = new Logger(VerifyTwoFactorUseCase.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IJwtProvider)
    private readonly jwtProvider: IJwtProvider,
    @Inject(IMessagingProvider)
    private readonly messagingProvider: IMessagingProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: VerifyTwoFactorUseCaseInput,
  ): Promise<VerifyTwoFactorUseCaseOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const code = await this.authRepository.findValidTwoFactorCode(
      user.id,
      input.code,
      new Date(),
    );

    if (!code) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.authRepository.invalidateTwoFactorCode(code.id, new Date());

    const accessToken = await this.jwtProvider.signAccessToken({
      id: user.id,
      email: user.email,
      profile: user.profile,
    });

    try {
      await this.messagingProvider.publish('auth.login.success', {
        userId: user.id,
        email: user.email,
        profile: user.profile,
      });
    } catch (error) {
      this.logger.warn('Failed to publish auth.login.success event');
      this.logger.debug(String(error));
    }

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('auth.jwt.expiresInSeconds', 3600),
      profile: user.profile,
    };
  }
}
