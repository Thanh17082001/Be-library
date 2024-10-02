import {forwardRef, Module} from '@nestjs/common';
import {CaslAbilityFactory} from './casl-ability.factory/casl-ability.factory';
import {CaslGuard} from './casl.guard';
import {RoleModule} from 'src/role/role.module';

@Module({
  imports: [forwardRef(() => RoleModule)],
  providers: [CaslAbilityFactory, CaslGuard],
  exports: [CaslAbilityFactory, CaslGuard],
})
export class CaslModule {}
