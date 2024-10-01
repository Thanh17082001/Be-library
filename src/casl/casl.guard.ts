import {Injectable, CanActivate, ExecutionContext, ForbiddenException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';

import {CHECK_POLICIES_KEY} from './check-policies.decorator';
import {AppAbility, CaslAbilityFactory} from './casl-ability.factory/casl-ability.factory';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // if (user.isAdmin) {
    //   return true;
    // }

    // Tạo ability cho user
    const ability = this.caslAbilityFactory.createForUser(user);

    // Lấy các policy từ metadata
    const policies = this.reflector.getAllAndOverride<Array<(ability: AppAbility) => boolean>>(CHECK_POLICIES_KEY, [context.getHandler(), context.getClass()]);

    if (!policies) {
      return true; // Nếu không có policy, cho phép truy cập
    }

    // Kiểm tra từng policy
    const isAllowed = policies.every(policy => policy(ability));
    if (!isAllowed) {
      throw new ForbiddenException('Forbidden resource');
    }

    return true;
  }
}
