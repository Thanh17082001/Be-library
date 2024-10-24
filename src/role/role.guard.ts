import {RoleService} from 'src/role/role.service';
import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {Level, Role} from './role.enum';
import {ROLES_KEY} from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    if (user?.isAdmin) {
      return true;
    }
    console.log(user.roleId);

    if (!user) {
      return false;
    }
    const isRole = requiredRoles?.some(role => user.roleId.name == role);
    return isRole;
  }
}
