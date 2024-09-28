import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Permission } from 'src/user/entities/user.entity';


export class PermissonRoleDto {
    @ApiProperty()
    @IsString()
    roleId: string;

    @ApiProperty({ example: [{ action: 'read', resource: 'test' }] })
    @IsOptional()
    permissons: Permission[];
}
