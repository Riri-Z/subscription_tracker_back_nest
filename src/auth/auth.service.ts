import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashService } from 'src/shared/utils/hash.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { jwtConstants } from './constants';
import { UserRole } from 'src/users/enums/UserRole';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly configService: ConfigService,
  ) {}

  validateUser = async (username: string, password: string): Promise<User> => {
    try {
      const user = await this.userService.findOneByUsername(username);
      const isMatchPassword = await this.hashService.comparePassword(
        user.password,
        password,
      );
      if (user && isMatchPassword) {
        delete user.password;
        return user;
      }

      return null;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user', {
        cause: error,
      });
    }
  };

  async login(user: User) {
    try {
      const { accessToken, refreshToken } = await this.getTokens(
        user.id,
        user.username,
        user.roles,
      );
      const {
        createdAt,
        updatedAt,
        deletedAt,
        password,
        ...userWithoutConfidentialData
      } = user;
      return { accessToken, refreshToken, userWithoutConfidentialData };
    } catch (error) {
      throw new InternalServerErrorException('Error login user', {
        cause: error,
      });
    }
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const user = await this.userService.findOneByUsername(payload.username);

    return this.login(user);
  }

  async resetPassword(newPassword: string, token) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const { id, ...user } = await this.userService.findOneByUsername(
        payload.username,
      );
      if (user.activeResetId !== payload.activeResetId) {
        return {
          success: false,
          message:
            "Le lien de réinitialisation n'est plus valide. Veuillez faire une nouvelle demande.",
        };
      }
      user.password = newPassword;
      user.activeResetId = null;
      await this.userService.update(id, user);
      return {
        success: true,
        message: 'Nouveau mot de passe enregistré avec succés',
      };
    } catch (error) {
      /* Token expired */
      if (error instanceof TokenExpiredError) {
        return {
          success: false,
          message: 'Le lien de réinitialisation a expiré',
        };
      }
      /* Error payload */
      if (error instanceof JsonWebTokenError) {
        return { success: false, message: 'Lien de réinitialisation invalide' };
      }
      /* Any Error */
      console.error(
        'Erreur lors de la réinitialisation du mot de passe:',
        error,
      );
      return {
        success: false,
        message:
          'Une erreur est survenue lors de la réinitialisation du mot de passe',
      };
    }
  }

  async logout(user: JwtPayload): Promise<string> {
    return 'User  has been log out';
  }

  async getTokens(userId: number, username: string, roles: UserRole[]) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          roles,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '24h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          roles,
          username,
        },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
