import {BadRequestException, HttpException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {AssetService} from 'src/asset/asset.service';
import {SoftDeleteModel} from 'mongoose-delete';
import {CreateLibraryDto} from 'src/library/dto/create-library.dto';
import {Liquidation} from './entities/liquidation.entity';
import {CreateLiquidationDto} from './dto/create-liquidation.dto';
import {Types} from 'mongoose';
import {Asset} from 'src/asset/entities/asset.entity';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {UpdateLiquidationDto} from './dto/update-liquidation.dto';
import {PublicationService} from 'src/publication/publication.service';
import {error} from 'console';
import {Publication} from 'src/publication/entities/publication.entity';
import {UploadFileSignature} from './dto/upload-file.dto';
import {existsSync, statSync, unlinkSync, promises as fs} from 'fs';
import * as path from 'path';

@Injectable()
export class LiquidationService {
  constructor(
    @InjectModel(Liquidation.name) private LiquidationModel: SoftDeleteModel<Liquidation>,
    private readonly assetservice: AssetService,
    private readonly publicationService: PublicationService
  ) {}
  async create(createDto: CreateLiquidationDto): Promise<any> {
    const liquidations = [];
    const errors: string[] = [];
    if (createDto?.liquidations?.length == 0 || !createDto.liquidations) {
      throw new BadRequestException('Invalid asset');
    }
    for (let i = 0; i < createDto.liquidations.length; i++) {
      const itemId = createDto.liquidations[i].itemId;
      let item: any = {};
      if (createDto.liquidations[i].type == 'Publication') {
        item = await this.publicationService.findById(new Types.ObjectId(itemId));
      } else {
        item = await this.assetservice.findById(new Types.ObjectId(itemId));
        console.log(item);
      }
      if (!item) {
        errors.push(`Không tìm thấy ${createDto.liquidations[i].type == 'Publication' ? `sách ${itemId}` : `tài sản ${itemId}`}`);
      } else {
        liquidations.push({
          ...item,
          ...createDto.liquidations[i],
        });
      }
    }
    createDto.liquidations = liquidations;

    if (errors.length > 0 && createDto.liquidations.length == 0) {
      return {
        result: null,
        errors,
      };
    }
    const result: Liquidation = await this.LiquidationModel.create(createDto);

    return {
      result,
      errors,
    };
  }

  async signature(id: string): Promise<any> {
    const liquidation: Liquidation = await this.LiquidationModel.findById(new Types.ObjectId(id));

    if (!liquidation) {
      throw new NotFoundException('Resource not found');
    }
    let resutl;
    let errors: string[] = [];

    // thủ thư và hieuj trưởng ký
    if (liquidation.signatures.length == 0) {
      resutl = await this.LiquidationModel.findByIdAndUpdate(
        id,
        {signatures: [...liquidation.signatures, 'thủ thư']},
        {
          returnDocument: 'after',
        }
      );
    }
    // hiệu trưởng ký
    else {
      resutl = await this.LiquidationModel.findByIdAndUpdate(
        id,
        {signatures: [...liquidation.signatures, 'hiệu trưởng'], isAccept: true},
        {
          returnDocument: 'after',
        }
      );

      // trừ số lượng tài sản hoặc ấn phẩm
      for (let i = 0; i < liquidation.liquidations.length; i++) {
        const item = liquidation.liquidations[i];
        console.log(item);
        item.itemId = item.itemId;
        // tài sản
        if (item.type == 'Asset') {
          const asset: Asset = await this.assetservice.findById(item.itemId);
          if (!asset) {
            throw new NotFoundException('Asset not found');
          }
          if (item.position == 'trong kho') {
            if (item.quantityLiquidation > asset.quantityWarehouse) {
              errors.push(`số lượng ${asset.name} trong kho không đủ`);
            } else {
              await this.assetservice.update(asset?._id?.toString(), {quantityLiquidation: asset?.quantityLiquidation || 0 + item.quantityLiquidation, quantityWarehouse: asset.quantityWarehouse - item.quantityLiquidation});
            }
          } else {
            if (item.quantityLiquidation > asset.quantityUsed) {
              errors.push(`số lượng ${asset.name} đang sử dụng không đủ`);
            } else {
              await this.assetservice.update(asset?._id?.toString(), {quantityLiquidation: asset?.quantityLiquidation || 0 + item.quantityLiquidation, quantityUsed: asset.quantityUsed - item.quantityLiquidation});
            }
          }
        }
        // ấn phẩm
        if (item.type == 'Publication') {
          const publication: Publication = await this.publicationService.findById(item.itemId);
          if (!publication) {
            throw new NotFoundException('publication not found');
          }
          if (item.position == 'trong kho') {
            if (item.quantityLiquidation > publication.quantity) {
              errors.push(`số lượng ${publication.name} trong kho không đủ`);
            } else {
              await this.publicationService.updateQuantityLiquidation(publication?._id?.toString(), {quantityLiquidation: publication?.quantityLiquidation || 0 + item.quantityLiquidation, quantity: publication.quantity - item.quantityLiquidation});
            }
          } else {
            if (item.quantityLiquidation > publication.shelvesQuantity) {
              errors.push(`số lượng ${publication.name} đang sử dụng không đủ`);
            } else {
              await this.publicationService.updateQuantityLiquidation(publication?._id?.toString(), {quantityLiquidation: publication?.quantityLiquidation || 0 + item.quantityLiquidation, quantityUsed: publication.shelvesQuantity - item.quantityLiquidation});
            }
          }
        }
      }
    }
    return {
      resutl,
      errors,
    };
  }

  async accept(id: string): Promise<Liquidation> {
    const Liquidation = await this.LiquidationModel.findById(new Types.ObjectId(id));
    if (Liquidation.isAccept) {
      throw new BadRequestException('Liquidation already accept');
    }
    if (!Liquidation) {
      throw new NotFoundException('Resource not found');
    }
    // mảng items asset trong phiếu nhập kho
    for (let i = 0; i < Liquidation.assets.length; i++) {
      const item = Liquidation.assets[i];
      item.assetId = new Types.ObjectId(item.assetId);
      const asset: Asset = await this.assetservice.findById(item.assetId);
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }
      await this.assetservice.update(asset?._id?.toString(), {quantityWarehouse: asset.quantityWarehouse + item.quantity, quantityTotal: asset.quantityTotal + item.quantity, priceInput: item.price});
    }
    await this.LiquidationModel.findByIdAndUpdate(id, {isAccept: true});
    return Liquidation;
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<CreateLiquidationDto>): Promise<PageDto<Liquidation>> {
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
      this.LiquidationModel.find(mongoQuery)
        // .populate({
        //   path: 'liquidations.itemId',
        //   select: 'name description price', // Fields to include from Asset or Publication
        // })
        .populate('createBy')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.LiquidationModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<Liquidation>> {
    return new ItemDto(await this.LiquidationModel.findById(id));
  }

  async update(id: string, updateDto: UpdateLiquidationDto): Promise<Liquidation> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const resource: Liquidation = await this.LiquidationModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    // if (resource.isAccept) {
    //   throw new HttpException('ware house receipt is accepted', 400);
    // }

    const assets = [];

    for (let i = 0; i < updateDto.liquidations.length; i++) {
      const assetId = updateDto.liquidations[i].itemId;
      const asset = await this.assetservice.findById(assetId);

      assets.push({
        ...updateDto.liquidations[i],
        ...asset,
      });
    }
    updateDto.liquidations = assets;

    return this.LiquidationModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<Liquidation> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Liquidation = await this.LiquidationModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    // if (resource.isAccept) {
    //   throw new HttpException('ware house receipt is accepted', 400);
    // }
    return await this.LiquidationModel?.deleteById(new Types.ObjectId(id));
  }

  async uploadFile(id: string, uploadDto: UploadFileSignature): Promise<Liquidation> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Liquidation = await this.LiquidationModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Không tìm thấy phiếu thanh lý');
    }

    if (!resource.isAccept) {
      const oldImagePath = path.join(__dirname, '..', '..', 'public', uploadDto.fileSignature.path);

      if (existsSync(oldImagePath)) {
        unlinkSync(oldImagePath);
      }
      throw new BadRequestException('Chưa có chữ ký của hiệu trưởng');
    }
    if (uploadDto.update === '0' && resource.fileSignature) {
      const oldImagePath = path.join(__dirname, '..', '..', 'public', uploadDto.fileSignature.path);

      if (existsSync(oldImagePath)) {
        unlinkSync(oldImagePath);
      }
      throw new BadRequestException('File đã được tải lên');
    } else if (uploadDto.update === '1' && resource.fileSignature) {
      const oldImagePath = path.join(__dirname, '..', '..', 'public', resource.fileSignature.path);

      if (existsSync(oldImagePath)) {
        unlinkSync(oldImagePath);
      }
    }
    return await this.LiquidationModel?.findByIdAndUpdate(new Types.ObjectId(id), {fileSignature: uploadDto.fileSignature}, {returnDocument: 'after'});
  }

  async removes(ids: string[]): Promise<Array<Liquidation>> {
    const arrResult: Liquidation[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Liquidation = await this.LiquidationModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      // if (resource.isAccept) {
      //   throw new HttpException('ware house receipt is accepted', 400);
      // }
      const result = await this.LiquidationModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<CreateLiquidationDto>): Promise<PageDto<Liquidation>> {
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
      this.LiquidationModel.findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .populate('supplierId')
        .populate('createBy')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.LiquidationModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Liquidation>> {
    return new ItemDto(await this.LiquidationModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreById(id: string): Promise<Liquidation> {
    const restoredDocument = await this.LiquidationModel.restore({_id: id});

    // Kiểm tra xem tài liệu đã được khôi phục hay không
    if (!restoredDocument) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return restoredDocument;
  }

  async restoreByIds(ids: string[]): Promise<Liquidation[]> {
    const restoredDocuments = await this.LiquidationModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.LiquidationModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<Liquidation> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Liquidation = await this.LiquidationModel.findOne(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (resource.signatures.includes('hiệu trưởng')) {
      throw new HttpException('Hiệu trưởng đã ký không thể xóa', 400);
    }
    return await this.LiquidationModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.LiquidationModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
