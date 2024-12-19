import {PartialType} from '@nestjs/swagger';
import {CreateTypeAssetDto} from './create-type-asset.dto';

export class UpdateTypeAssetDto extends PartialType(CreateTypeAssetDto) {}
