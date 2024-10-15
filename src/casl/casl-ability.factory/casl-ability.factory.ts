import {UserService} from './../../user/user.service';
import {Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects} from '@casl/ability';
import {ForbiddenException, Injectable} from '@nestjs/common';
import {User} from 'src/user/entities/user.entity';
import {Action} from '../casl.action';
import {RoleService} from 'src/role/role.service';

type Subjects = InferSubjects<any> | 'all'; // Bạn có thể tùy chỉnh tài nguyên của mình ở đây
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private roleService: RoleService) {}
  async createForUser(user: User) {
    const role = await this.roleService.findById(user?.roleId?._id.toString());
    const {can, cannot, build} = new AbilityBuilder<Ability<[Action, Subjects]>>(Ability as AbilityClass<AppAbility>);
    if (user?.isAdmin) {
      can(Action.Manage, 'all'); // Admin có thể thực hiện mọi hành động trên mọi tài nguyên)
    }

    if (!role?.permissions || !Array.isArray(role?.permissions)) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    role?.permissions.forEach(permission => {
      // Kiểm tra xem action và resource có hợp lệ không
      if (permission.action && permission.resource) {
        if (permission.action == Action.Manage) {
          can(Action.Create, permission.resource as Subjects);
          can(Action.Read, permission.resource as Subjects);
          can(Action.Update, permission.resource as Subjects);
          can(Action.Delete, permission.resource as Subjects);
        } else {
          // Chỉ gán action cụ thể cho resource
          can(permission.action as Action, permission.resource as Subjects);
        }
      }
    });

    return build({
      detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
