import { AuthService } from './auth.service';
import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBasicAuth()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'username',
          description: 'Username',
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
  @Post()
  async login(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(
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

        .send({ accessToken, refreshToken, user });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Post('logout')
  async logout(@Res() res: Response, @Request() req) {
    const user: JwtPayload = req?.user;

    const cookies = req?.cookies;
    if (cookies?.accessToken) {
      res.clearCookie('accessToken');
    }
    if (cookies?.refreshToken) {
      res.clearCookie('refreshToken');
    }
    const result = await this.authService.logout(user);

    return res.status(200).json({
      details: result,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Get('session')
  async session(@Request() req) {
    return { message: 'Authenticated', user: req.user };
  }
}
