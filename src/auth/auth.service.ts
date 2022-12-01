import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto, AuthenticationDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Roles } from '../users/schemas/user.schemas';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly httpService: HttpService
  ) { }

  async sendConfimCode(phoneNumber: string) {
    const smsToken = this.configService.get<string>('SMS_TOKEN')
    const bodyId = +this.configService.get<string>('SMS_BODY_ID')
    const confirmCode = Math.floor(1000 + Math.random() * 9000).toString()
    const body = { to: phoneNumber, bodyId, args: [confirmCode] }
    try {
      this.createUser({ phoneNumber, confirmCode })
      await this.httpService.axiosRef.post(`https://console.melipayamak.com/api/send/shared/${smsToken}`, body);
      return { message: 'Code sended' };
    } catch (error) {
      throw new InternalServerErrorException('Error while sending code');
    }
  }

  async authentication(data: AuthenticationDto) {
    const user = await this.usersService.findByPhoneNumber(data.phoneNumber);
    if (!user) throw new BadRequestException('User does not exist');
    const confirmCodeMatches = await argon2.verify(user.confirmCode, data.confirmCode);
    if (!confirmCodeMatches)
      throw new BadRequestException('confirmCode is incorrect');
    const tokens = await this.getTokens(user._id, user.phoneNumber, user.roles);
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    return { message: 'Signin successful.', data: tokens };

  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.usersService.findByPhoneNumber(createUserDto.phoneNumber);
    if (!user) {
      await this.usersService.create(createUserDto)
    }
    else {
      const confirmCode = await this.hashData(createUserDto.confirmCode)
      await this.usersService.update(user._id, { confirmCode })
    }
  }


  async logout(userId: string) {
    try {
      this.usersService.update(userId, { refreshToken: null });
      return { message: 'Logout successful.' };
    } catch (error) {
      throw new HttpException('User has exist', HttpStatus.BAD_REQUEST);
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, user.phoneNumber, user.roles);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { message: 'Token generated.', data: tokens };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, phoneNumber: string, roles: Roles[]) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          phoneNumber,
          roles
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          phoneNumber,
          roles
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  hashData(data: string) {
    return argon2.hash(data);
  }
}
