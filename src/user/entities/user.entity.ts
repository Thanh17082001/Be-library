import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/common/base-document';

export type Permission={
    action: string;
    resource: string;
}

@Schema()
export class User extends BaseDocument {

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: false, default: '', unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop({ required: true })
    fullname: string;

    @Prop({ default:'' })
    phoneNumber: string;
    
    @Prop({ default:'' })
    address: string;

    @Prop({ default: '' })
    avatar: string;

    @Prop({default: new Date()})
    birthday: Date;
    
    @Prop({ enum: ['nam', 'nữ', 'khác'], default: 'khác'})
    gender:string


    @Prop({
        default: [{ action: 'read', resource: 'test' }], // Người dùng có thể có nhiều quyền
    })
    permissions: Permission[];

    @Prop({ default: 'user' }) // Vai trò của người dùng
    role: string;

    @Prop({ default: false }) // Vai trò của người dùng
    isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

