import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface Roles { }

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop()
  confirmCode: string;

  @Prop({ default: 'USER' })
  roles: Roles[];

  @Prop()
  refreshToken: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
