import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityNotFoundError } from 'typeorm';
import { ResponseUserDTO } from './dto/response-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ApiResponseService } from 'src/shared/api-response/api-response.service';

// TODO :  Add global error handler
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@ApiCookieAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly apiResponseService: ApiResponseService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.usersService.create(createUserDto);
      const body = ResponseUserDTO.fromEntity(newUser);
      return this.apiResponseService.apiResponse(HttpStatus.CREATED, body);
    } catch (error) {
      console.error(error);
      // 23505 is a code from typeORM when there is conflict on uniqueness
      if (error.name === 'ConflictException') {
        throw new ConflictException(error.message);
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new HttpException(
          "Une erreur est survenue lors de la création de l'utilisateur",
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      const body = users.map((user) => ResponseUserDTO.fromEntity(user));
      return this.apiResponseService.apiResponse(HttpStatus.OK, body);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `Une erreur est survenue lors de la récupération de tous les utilisateurs`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  async findOneById(@Param('id') id: number) {
    try {
      const user = await this.usersService.findOneById(+id);
      const body = ResponseUserDTO.fromEntity(user);
      return this.apiResponseService.apiResponse(HttpStatus.OK, body);
    } catch (error) {
      console.error(error);
      if (error instanceof EntityNotFoundError) {
        throw new HttpException(
          `L'utilisateur avec l'id ${id} n'a pas été trouvé`,
          HttpStatus.NOT_FOUND,
        );
      } else
        throw new HttpException(
          "Une erreur est survenue lors de la récupération de l'utilisateur " +
            id,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  async findOneByUsername(@Param('username') username: string) {
    try {
      const user = await this.usersService.findOneByUsername(username);
      const body = ResponseUserDTO.fromEntity(user);
      return this.apiResponseService.apiResponse(HttpStatus.OK, body);
    } catch (error) {
      console.error(error);
      if (error instanceof EntityNotFoundError) {
        throw new HttpException(
          `L'utilisateur avec l'username ${username} n'a pas été trouvé`,
          HttpStatus.NOT_FOUND,
        );
      } else
        throw new HttpException(
          "Une erreur est survenue lors de la récupération de l'utilisateur, username : " +
            username,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      const body = ResponseUserDTO.fromEntity(updatedUser);
      return this.apiResponseService.apiResponse(HttpStatus.OK, body);
    } catch (error) {
      console.error('patch user, ', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.delete(+id);
      const body = {
        message: `Utilisateur avec l'id ${id} a été supprimé avec succès`,
      };
      return this.apiResponseService.apiResponse(HttpStatus.OK, body);
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      } else
        throw new InternalServerErrorException(
          `Une erreur est survenue lors de la suppréssion de l'utilisateur ${id}`,
        );
    }
  }
}
