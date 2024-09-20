import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/common/base-document';

type permission={
    action: string;
    resource: string;
}

@Schema()
export class User extends BaseDocument {
    @Prop({ unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop({
        default: [{ action: 'read', resource: 'test' }], // Người dùng có thể có nhiều quyền
    })
    permissions: permission[];

    @Prop({ default: 'user' }) // Vai trò của người dùng
    role: string;

    @Prop({ default: false }) // Vai trò của người dùng
    isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

