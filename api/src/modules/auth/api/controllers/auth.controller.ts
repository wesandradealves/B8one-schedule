import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ILoginUseCase,
  LoginUseCaseInput,
} from '@/domain/interfaces/use-cases/auth/login.use-case';
import {
  IVerifyTwoFactorUseCase,
  VerifyTwoFactorUseCaseInput,
} from '@/domain/interfaces/use-cases/auth/verify-two-factor.use-case';
import {
  IRequestPasswordRecoveryUseCase,
  RequestPasswordRecoveryUseCaseInput,
} from '@/domain/interfaces/use-cases/auth/request-password-recovery.use-case';
import {
  IVerifyPasswordRecoveryCodeUseCase,
  VerifyPasswordRecoveryCodeUseCaseInput,
} from '@/domain/interfaces/use-cases/auth/verify-password-recovery-code.use-case';
import {
  IResetPasswordUseCase,
  ResetPasswordUseCaseInput,
} from '@/domain/interfaces/use-cases/auth/reset-password.use-case';
import {
  IVerifyEmailConfirmationUseCase,
  VerifyEmailConfirmationUseCaseInput,
} from '@/domain/interfaces/use-cases/auth/verify-email-confirmation.use-case';
import { LoginRequestDto } from '../dto/login.request.dto';
import { LoginResponseDto } from '../dto/login.response.dto';
import { VerifyTwoFactorRequestDto } from '../dto/verify-two-factor.request.dto';
import { VerifyTwoFactorResponseDto } from '../dto/verify-two-factor.response.dto';
import { RequestPasswordRecoveryRequestDto } from '../dto/request-password-recovery.request.dto';
import { RequestPasswordRecoveryResponseDto } from '../dto/request-password-recovery.response.dto';
import { VerifyPasswordRecoveryCodeRequestDto } from '../dto/verify-password-recovery-code.request.dto';
import { VerifyPasswordRecoveryCodeResponseDto } from '../dto/verify-password-recovery-code.response.dto';
import { ResetPasswordRequestDto } from '../dto/reset-password.request.dto';
import { ResetPasswordResponseDto } from '../dto/reset-password.response.dto';
import { VerifyEmailConfirmationRequestDto } from '../dto/verify-email-confirmation.request.dto';
import { VerifyEmailConfirmationResponseDto } from '../dto/verify-email-confirmation.response.dto';
import { ZodValidationPipe } from '@/infrastructure/http/pipes/zod.validation.pipe';
import { loginSchema } from '../schemas/login.schema';
import { verifyTwoFactorSchema } from '../schemas/verify-two-factor.schema';
import { requestPasswordRecoverySchema } from '../schemas/request-password-recovery.schema';
import { verifyPasswordRecoveryCodeSchema } from '../schemas/verify-password-recovery-code.schema';
import { resetPasswordSchema } from '../schemas/reset-password.schema';
import { verifyEmailConfirmationSchema } from '../schemas/verify-email-confirmation.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(ILoginUseCase)
    private readonly loginUseCase: ILoginUseCase,
    @Inject(IVerifyTwoFactorUseCase)
    private readonly verifyTwoFactorUseCase: IVerifyTwoFactorUseCase,
    @Inject(IRequestPasswordRecoveryUseCase)
    private readonly requestPasswordRecoveryUseCase: IRequestPasswordRecoveryUseCase,
    @Inject(IVerifyPasswordRecoveryCodeUseCase)
    private readonly verifyPasswordRecoveryCodeUseCase: IVerifyPasswordRecoveryCodeUseCase,
    @Inject(IResetPasswordUseCase)
    private readonly resetPasswordUseCase: IResetPasswordUseCase,
    @Inject(IVerifyEmailConfirmationUseCase)
    private readonly verifyEmailConfirmationUseCase: IVerifyEmailConfirmationUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate credentials and send a 2FA code by e-mail' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(
    @Body(new ZodValidationPipe(loginSchema))
    payload: LoginUseCaseInput,
  ): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(payload);
  }

  @Post('2fa/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate 2FA code and issue JWT access token' })
  @ApiBody({ type: VerifyTwoFactorRequestDto })
  @ApiResponse({ status: 200, type: VerifyTwoFactorResponseDto })
  async verifyTwoFactor(
    @Body(new ZodValidationPipe(verifyTwoFactorSchema))
    payload: VerifyTwoFactorUseCaseInput,
  ): Promise<VerifyTwoFactorResponseDto> {
    return this.verifyTwoFactorUseCase.execute(payload);
  }

  @Post('password-recovery/request')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send password recovery 2FA code by e-mail' })
  @ApiBody({ type: RequestPasswordRecoveryRequestDto })
  @ApiResponse({ status: 200, type: RequestPasswordRecoveryResponseDto })
  async requestPasswordRecovery(
    @Body(new ZodValidationPipe(requestPasswordRecoverySchema))
    payload: RequestPasswordRecoveryUseCaseInput,
  ): Promise<RequestPasswordRecoveryResponseDto> {
    return this.requestPasswordRecoveryUseCase.execute(payload);
  }

  @Post('password-recovery/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify password recovery 2FA code' })
  @ApiBody({ type: VerifyPasswordRecoveryCodeRequestDto })
  @ApiResponse({ status: 200, type: VerifyPasswordRecoveryCodeResponseDto })
  async verifyPasswordRecoveryCode(
    @Body(new ZodValidationPipe(verifyPasswordRecoveryCodeSchema))
    payload: VerifyPasswordRecoveryCodeUseCaseInput,
  ): Promise<VerifyPasswordRecoveryCodeResponseDto> {
    return this.verifyPasswordRecoveryCodeUseCase.execute(payload);
  }

  @Post('password-recovery/reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with validated 2FA recovery code' })
  @ApiBody({ type: ResetPasswordRequestDto })
  @ApiResponse({ status: 200, type: ResetPasswordResponseDto })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema))
    payload: ResetPasswordUseCaseInput,
  ): Promise<ResetPasswordResponseDto> {
    return this.resetPasswordUseCase.execute(payload);
  }

  @Post('email-confirmation/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm user e-mail and activate account' })
  @ApiBody({ type: VerifyEmailConfirmationRequestDto })
  @ApiResponse({ status: 200, type: VerifyEmailConfirmationResponseDto })
  async verifyEmailConfirmation(
    @Body(new ZodValidationPipe(verifyEmailConfirmationSchema))
    payload: VerifyEmailConfirmationUseCaseInput,
  ): Promise<VerifyEmailConfirmationResponseDto> {
    return this.verifyEmailConfirmationUseCase.execute(payload);
  }
}
