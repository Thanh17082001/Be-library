import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {SoftDeleteModel} from 'mongoose-delete';
import {Publication} from 'src/publication/entities/publication.entity';
import {generateBarcode} from 'src/common/genegrate-barcode';
import {StockAsset} from './entities/stock-asset.entity';
import {CreateStockAssetDto} from './dto/create-stock-asset.dto';
import {AssetService} from 'src/asset/asset.service';
import {Asset} from 'src/asset/entities/asset.entity';
import {UpdateAssetDto} from 'src/asset/dto/update-asset.dto';
import {UpdateStockAssetDto} from './dto/update-stock-asset.dto';

@Injectable()
export class StockAssetService {
  constructor(
    @InjectModel(StockAsset.name) private StockAssetModel: SoftDeleteModel<StockAsset>,
    private readonly assetservice: AssetService
  ) {}
  async create(createDto: CreateStockAssetDto): Promise<StockAsset> {
    const assets = [];
    if (createDto?.assets?.length == 0 || !createDto.assets) {
      throw new BadRequestException('Invalid asset');
    }
    for (let i = 0; i < createDto.assets.length; i++) {
      const assetId = createDto.assets[i].assetId;
      const asset = await this.assetservice.findById(assetId);

      assets.push({
        ...asset,
        ...createDto.assets[i],
      });
    }
    createDto.assets = assets;
    createDto.barcode = generateBarcode();
    const result: StockAsset = await this.StockAssetModel.create(createDto);

    return result;
  }

  async accept(id: string): Promise<StockAsset> {
    const stockAsset = await this.StockAssetModel.findById(new Types.ObjectId(id));
    if (stockAsset.isAccept) {
      throw new BadRequestException('stockAsset already accept');
    }
    if (!stockAsset) {
      throw new NotFoundException('Resource not found');
    }
    // mảng items asset trong phiếu nhập kho
    for (let i = 0; i < stockAsset.assets.length; i++) {
      const item = stockAsset.assets[i];
      item.assetId = new Types.ObjectId(item.assetId);
      const asset: Asset = await this.assetservice.findById(item.assetId);
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }
      await this.assetservice.update(asset?._id?.toString(), {
        quantityWarehouse: asset.quantityWarehouse + item.quantity,
        quantityTotal: asset.quantityTotal + item.quantity,
        priceInput: item.price,
      });
    }
    await this.StockAssetModel.findByIdAndUpdate(id, {isAccept: true});
    return stockAsset;
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<CreateStockAssetDto>): Promise<PageDto<StockAsset>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {isActive: 1};
    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          mongoQuery[key] = query[key];
        }
      });
    }

    //search document
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.StockAssetModel.find(mongoQuery)
        .populate('supplierId')
        .populate('createBy')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.StockAssetModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<StockAsset>> {
    return new ItemDto(await this.StockAssetModel.findById(id));
  }

  async update(id: string, updateDto: UpdateStockAssetDto): Promise<StockAsset> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const resource: StockAsset = await this.StockAssetModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (resource.isAccept) {
      throw new HttpException('ware house receipt is accepted', 400);
    }

    const assets = [];

    for (let i = 0; i < updateDto.assets.length; i++) {
      const assetId = updateDto.assets[i].assetId;
      const asset = await this.assetservice.findById(assetId);

      assets.push({
        ...updateDto.assets[i],
        ...asset,
      });
    }
    updateDto.assets = assets;

    return this.StockAssetModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<StockAsset> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: StockAsset = await this.StockAssetModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (resource.isAccept) {
      throw new HttpException('ware house receipt is accepted', 400);
    }
    return await this.StockAssetModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<StockAsset>> {
    const arrResult: StockAsset[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: StockAsset = await this.StockAssetModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      if (resource.isAccept) {
        throw new HttpException('ware house receipt is accepted', 400);
      }
      const result = await this.StockAssetModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<CreateStockAssetDto>): Promise<PageDto<StockAsset>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {}; // Điều kiện để tìm các tài liệu đã bị xóa mềm

    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          mongoQuery[key] = query[key];
        }
      });
    }

    // Tìm kiếm tài liệu
    if (search) {
      mongoQuery.name = {$regex: new RegExp(search, 'i')};
    }

    // Thực hiện phân trang và sắp xếp
    const [results, itemCount] = await Promise.all([
      this.StockAssetModel.findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .populate('supplierId')
        .populate('createBy')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.StockAssetModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<StockAsset>> {
    return new ItemDto(await this.StockAssetModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<StockAsset> {
    const restoredDocument = await this.StockAssetModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<StockAsset[]> {
    const restoredDocuments = await this.StockAssetModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.StockAssetModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<StockAsset> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: StockAsset = await this.StockAssetModel.findOneDeleted(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (resource.isAccept) {
      throw new HttpException('ware house receipt is accepted', 400);
    }
    return await this.StockAssetModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.StockAssetModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
