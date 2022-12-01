export class CreateUserDto {
  phoneNumber: string;
  confirmCode: string;
  firstName?: string;
  lastName?: string;
  refreshToken?: string;
}
