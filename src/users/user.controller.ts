import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AbilitiesGuard } from '../common/ability/ability.guard';
import { User } from './schemas/user.schemas';
import { CheckAbilities } from '../common/ability/ability.decorator';
import { Action } from '../common/ability/ability.factory';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';

@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Manage, subject: User })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      await this.usersService.create(createUserDto);
      return {
        message: 'User created.',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('User has exist', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(error.message, 500);
      }
    }
  }
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Manage, subject: User })
  @Get()
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return {
        message: "List recived.",
        data: users
      };
    } catch (error) {
      throw new HttpException(error.message, 500);

    }
  }
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Manage, subject: User })
  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      return {
        message: "User founded",
        data: user
      };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Manage, subject: User })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      await this.usersService.update(id, updateUserDto);
      return {
        message: "User updated.",
      };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }

  }
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Manage, subject: User })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(id);
      return {
        message: "User deleted."
      }
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
