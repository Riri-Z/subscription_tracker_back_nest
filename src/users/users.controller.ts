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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityNotFoundError } from 'typeorm';

// TODO :  Add global error handler
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new HttpException(
          "Une erreur est survenue lors de la création de l'utilisateur",
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @Get()
  findAll() {
    try {
      return this.usersService.findAll();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `Une erreur est survenue lors de la récupération de tous les utilisateurs`,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.usersService.findOne(+id);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.delete(+id);
      return {
        message: `Utilisateur avec l'id ${id} a été supprimé avec succès`,
      };
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
