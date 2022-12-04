export class CreateUserDto {
  phoneNumber: string;
  confirmCode: string;
  confirmCodeDispatchTime?:string;
  firstName?: string;
  lastName?: string;
  refreshToken?: string;
}
