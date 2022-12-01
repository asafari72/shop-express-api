import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects, PureAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../../users/schemas/user.schemas";
import { UsersService } from "../../users/users.service";

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}


export type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>


@Injectable()
export class AbilityFactory {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async defineAbility(user: User) {
        // define rules
        const { can, cannot, build } = new AbilityBuilder(PureAbility as AbilityClass<AppAbility>)
        if (user.roles.includes('ADMIN')) {
            // Admin can do anything
            can(Action.Manage, 'all')
        } else {
            can(Action.Read, User)
        }

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>
        })

    }
}
