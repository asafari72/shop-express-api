import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../users/schemas/user.schemas';
import { UsersModule } from '../../users/users.module';
import { AbilityFactory } from './ability.factory';

@Module({
    imports:[
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    ],
    providers: [AbilityFactory],
    exports: [AbilityFactory]
})
export class AbilityModule { }
