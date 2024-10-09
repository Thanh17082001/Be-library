import {PartialType} from '@nestjs/swagger';
import {CreateWarehouseReceiptDto} from './create-warehouse-receipt.dto';

export class UpdateWarehouseReceiptDto extends PartialType(CreateWarehouseReceiptDto) {}
