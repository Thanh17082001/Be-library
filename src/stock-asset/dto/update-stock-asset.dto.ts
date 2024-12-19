import {PartialType} from '@nestjs/swagger';
import {CreateStockAssetDto} from './create-stock-asset.dto';

export class UpdateStockAssetDto extends PartialType(CreateStockAssetDto) {}
