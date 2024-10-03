import {PartialType} from '@nestjs/swagger';
import {CreateLibraryStockDto} from './create-library-stock.dto';

export class UpdateLibraryStockDto extends PartialType(CreateLibraryStockDto) {}
