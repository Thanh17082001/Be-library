import {CreatePublicationDto} from './dto/create-publication.dto';
import {UpdatePublicationDto} from './dto/update-publication.dto';
import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {Publication} from './entities/publication.entity';
import * as pdfPoppler from 'pdf-poppler';
import {existsSync, unlinkSync, promises as fs} from 'fs';
import * as path from 'path';
import {SoftDeleteModel} from 'mongoose-delete';
import {UpdateQuantityShelves, UpdateQuantityStock} from './dto/update-shelvesdto';
import {LoanshipService} from 'src/loanship/loanship.service';
import {LoanSlip} from 'src/loanship/entities/loanship.entity';
import {Liquidation} from 'src/liquidation/entities/liquidation.entity';

@Injectable()
export class PublicationService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: SoftDeleteModel<Publication>,
    @InjectModel(LoanSlip.name) private loanSlipModel: SoftDeleteModel<LoanSlip>,
    @InjectModel(Liquidation.name) private liquidationModel: SoftDeleteModel<Liquidation>
  ) {}
  async create(createDto: CreatePublicationDto): Promise<Publication> {
    if (createDto.path == '') {
      createDto.path = '/publication/publication-default.jpg';
      createDto.priviewImage = '/publication/publication-default.jpg';
    }
    return await this.publicationModel.create(createDto);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Publication>): Promise<PageDto<Publication>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {isActive: 1};
    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          if (['categoryIds', 'authorIds', 'publisherIds', 'materialIds'].includes(key)) {
            mongoQuery[key] = {$in: query[key]};
          }
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
      this.publicationModel
        .find(mongoQuery)
        .populate('authorIds')
        .populate('categoryIds')
        .populate('publisherIds')
        .populate('materialIds')
        .populate('shelvesId')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.publicationModel.countDocuments(mongoQuery),
    ]);

    const publicationIds = results.map(result => result._id.toString());
    // console.log(publicationIds);

    const loans = await this.loanSlipModel.aggregate([
      {$unwind: '$publications'}, // Tách từng phần tử trong mảng publications
      {$match: {'publications.publicationId': {$in: publicationIds}, isAgree: true}}, // Lọc những phiếu mượn có publicationId trong danh sách
      {
        $group: {
          _id: '$publications.publicationId', // Gom nhóm theo publicationId
          totalQuantityLoan: {$sum: '$publications.quantityLoan'}, // Tính tổng quantityLoan cho từng cuốn sách
        },
      },
    ]);

    // Tính số lượng thanh lý và hư hỏng
    const liquidations = await this.liquidationModel.aggregate([
      {
        //lọc bản ghi trong resouce chỉ giữ lại bản ghi có publiccationId nằm trong array publicationIds
        $match: {
          publicationId: {$in: publicationIds},
        },
      },
      {
        //nhóm các record theo pubID và status sau đó tính tổng
        $group: {
          _id: {
            publicationId: '$publicationId',
            status: '$status', // Tính theo status
          },
          totalQuantity: {$sum: '$quantity'}, // Tính tổng số lượng
        },
      },
    ]);

    // Tạo map để lưu số lượng thanh lý và hư hỏng cho từng publicationId
    const liquidationMap = liquidations.reduce((map, liquidation) => {
      const {publicationId, status} = liquidation._id;
      if (!map[publicationId.toString()]) {
        map[publicationId.toString()] = {liquidation: 0, damaged: 0};
      }
      map[publicationId.toString()][status === 'thanh lý' ? 'liquidation' : 'damaged'] += liquidation.totalQuantity;
      return map;
    }, {});

    console.log(liquidationMap);

    // Tạo map để lưu số lượng mượn cho từng publicationId
    const loansMap = loans.reduce((map, loan) => {
      map[loan._id.toString()] = loan.totalQuantityLoan;
      return map;
    }, {});

    // Gắn tổng số lượng mượn vào từng publication
    const publicationsWithLoanCount = results.map(publication => ({
      ...publication,
      quantityLoan: loansMap[publication._id.toString()] ?? 0,
      quantityLiquidation: liquidationMap[publication._id.toString()]?.liquidation ?? 0, // Nếu không có thì đặt là 0
      quantityDamaged: liquidationMap[publication._id.toString()]?.damaged ?? 0, // Nếu không có thì đặt là 0
    }));

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(publicationsWithLoanCount, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<Publication>> {
    return new ItemDto(await this.publicationModel.findById(id));
  }

  async findByBarcode(barcode: string): Promise<ItemDto<Publication>> {
    return new ItemDto(await this.publicationModel.findOne({barcode}));
  }

  async findById(id: Types.ObjectId): Promise<Publication> {
    return await this.publicationModel.findById(id).lean();
  }

  async update(id: string, updateDto: UpdatePublicationDto): Promise<Publication> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const resource: Publication = await this.publicationModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    // co file
    if (updateDto.path) {
      const oldImagePath = path.join(__dirname, '..', '..', 'public', resource.path);
      if (existsSync(oldImagePath) && resource.path !== '/publication/publication-default.jpg') {
        unlinkSync(oldImagePath);
      }

      for (let i = 0; i < resource.images.length; i++) {
        const oldPath = path.join(__dirname, '..', '..', 'public', resource.images[i]);
        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
        }
      }
    } else {
      updateDto.path = resource.path;
      updateDto.images = resource.images;
      updateDto.priviewImage = resource.priviewImage;
    }
    return this.publicationModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async updateQuantityShelves(data: UpdateQuantityShelves): Promise<Publication> {
    const id = new Types.ObjectId(data.id);
    const publication = await this.publicationModel.findById(id);
    if (!publication) {
      throw new NotFoundException('Resource not found');
    }

    return await this.publicationModel.findByIdAndUpdate(id, {$inc: {quantity: -data.quantity, shelvesQuantity: data.quantity}, shelvesId: data.shelvesId});
  }

  async updateQuantityStock(data: UpdateQuantityStock): Promise<Publication> {
    const id = new Types.ObjectId(data.id);
    const publication = await this.publicationModel.findById(id);
    if (!publication) {
      throw new NotFoundException('Resource not found');
    }

    return await this.publicationModel.findByIdAndUpdate(id, {$inc: {quantity: +data.quantity, shelvesQuantity: -data.quantity}});
  }

  async convertPdfToImages(pdfPath: string): Promise<string[]> {
    try {
      const outputDir = path.join(__dirname, '../../public/images-convert');
      // const outputFiles: string[] = [];

      // Đảm bảo thư mục đầu ra tồn tại
      await fs.mkdir(outputDir, {recursive: true});
      const existingFiles = new Set(await fs.readdir(outputDir));

      // Thiết lập tùy chọn cho việc chuyển đổi
      const options = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
        page: null, // Chuyển đổi tất cả các trang
      };
      // Chuyển đổi PDF thành hình ảnh
      await pdfPoppler.convert(pdfPath, options);
      // Lấy danh sách các tệp đã chuyển đổi
      const newFiles = await fs.readdir(outputDir);
      const outputFiles = newFiles.filter(file => file.endsWith('.png') && !existingFiles.has(file)).map(file => `images-convert/${file}`);
      return outputFiles;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error('Failed to convert PDF to images');
    }
  }

  async remove(id: string): Promise<Publication> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Publication = await this.publicationModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.publicationModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<Publication>> {
    const arrResult: Publication[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: Publication = await this.publicationModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.publicationModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<Publication>): Promise<PageDto<Publication>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {}; // Điều kiện để tìm các tài liệu đã bị xóa mềm

    // Thêm các điều kiện từ `query`
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          if (['categoryIds', 'authorIds', 'publisherIds', 'materialIds'].includes(key)) {
            mongoQuery[key] = {$in: query[key]};
          }
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
      this.publicationModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.publicationModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<Publication>> {
    return new ItemDto(await this.publicationModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreByIds(ids: string[]): Promise<Publication[]> {
    const restoredDocuments = await this.publicationModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.publicationModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});
    return restoredDocuments;
  }

  async delete(id: string): Promise<Publication> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: Publication = await this.publicationModel.findOneDeleted(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.publicationModel?.findByIdAndDelete(new Types.ObjectId(id));
  }
  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.publicationModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
