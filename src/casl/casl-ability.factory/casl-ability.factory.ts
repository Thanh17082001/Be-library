import {Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects} from '@casl/ability';
import {ForbiddenException, Injectable} from '@nestjs/common';
import {User} from 'src/user/entities/user.entity';
import {Action} from '../casl.action';

type Subjects = InferSubjects<any> | 'all'; // Bạn có thể tùy chỉnh tài nguyên của mình ở đây
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const {can, cannot, build} = new AbilityBuilder<Ability<[Action, Subjects]>>(Ability as AbilityClass<AppAbility>);
    if (user?.isAdmin) {
      can(Action.Manage, 'all'); // Admin có thể thực hiện mọi hành động trên mọi tài nguyên)
    }

    if (!user?.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException('Invalid permissions');
    }

    user.permissions.forEach(permission => {
      // Kiểm tra xem action và resource có hợp lệ không
      if (permission.action && permission.resource) {
        can(permission.action as Action, permission.resource as Subjects);
      }
    });

    return build({
      detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
