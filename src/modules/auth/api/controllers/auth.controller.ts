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
import { LoginRequestDto } from '../dto/login.request.dto';
import { LoginResponseDto } from '../dto/login.response.dto';
import { VerifyTwoFactorRequestDto } from '../dto/verify-two-factor.request.dto';
import { VerifyTwoFactorResponseDto } from '../dto/verify-two-factor.response.dto';
import { ZodValidationPipe } from '@/infrastructure/http/pipes/zod.validation.pipe';
import { loginSchema } from '../schemas/login.schema';
import { verifyTwoFactorSchema } from '../schemas/verify-two-factor.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(ILoginUseCase)
    private readonly loginUseCase: ILoginUseCase,
    @Inject(IVerifyTwoFactorUseCase)
    private readonly verifyTwoFactorUseCase: IVerifyTwoFactorUseCase,
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
}
