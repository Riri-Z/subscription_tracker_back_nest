import { AuthService } from './auth/auth.service';
import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  /*  Response, */
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiResponseService } from './shared/api-response/api-response.service';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { Response } from 'express';

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
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'john.doe@example.com',
          description: 'User email',
        },
        password: {
          type: 'string',
          example: 'password123',
          description: 'User password',
        },
      },
      required: ['username', 'password'],
    },
  })
  async login(@Res({ passthrough: true }) res: Response, @Request() req) {
    const { accessToken, refreshToken } = await this.authService.login(
      req?.user,
    );

    res
      .cookie('accessToken', accessToken, {
        maxAge: 1 * 60 * 60 * 1000, //1h,
        httpOnly: true,
        secure: true,
      })
      .cookie('refreshToken', refreshToken, {
        maxAge: 1 * 60 * 60 * 1000, //1h,
        httpOnly: true,
        secure: true,
      })

      .send('Welcome');
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
