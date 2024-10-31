import { AuthService } from './auth/auth.service';
import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiResponseService } from './shared/api-response/api-response.service';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly apiResponseService: ApiResponseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @ApiBasicAuth()
  @Post('auth/login')
  async login(@Request() req) {
    const result = await this.authService.login(req.user);
    return this.apiResponseService.apiResponse(HttpStatus.OK, result);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Post('auth/logout')
  async logout(@Request() req) {
    const result = await this.authService.logout(req.user);
    return this.apiResponseService.apiResponse(HttpStatus.OK, result);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Post('auth/session')
  async session(@Request() req) {
    return { message: 'Authenticated', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Get('profile')
  getProfile(@Request() req) {
    return { message: 'welcome to user profile', body: req.user };
  }
}
