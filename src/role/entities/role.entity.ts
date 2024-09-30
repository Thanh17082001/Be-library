import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {BaseDocument} from 'src/common/base-document';
import {Permission} from 'src/user/entities/user.entity';

@Schema()
export class RoleS {
  @Prop({required: true, unique: true})
  name: string;
  @Prop({default: []})
  permissions: Permission[];
}
const RoleSchema = SchemaFactory.createForClass(RoleS);
RoleSchema.remove(['isPublic', 'isLink', 'libraryId', 'groupId']);
export {RoleSchema};
