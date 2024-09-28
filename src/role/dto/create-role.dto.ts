import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDto } from 'src/common/base.dto';
import { Permission } from 'src/user/entities/user.entity';

export class CreateRoleDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({
        example: {
            action: 'read',
            resource:'example'
    }})
    @IsOptional()
    permissions: Permission[];
}
