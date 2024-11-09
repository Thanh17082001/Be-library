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
import {existsSync, statSync, unlinkSync, promises as fs} from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import {SoftDeleteModel} from 'mongoose-delete';
import {UpdateQuantityShelves, UpdateQuantityStock} from './dto/update-shelvesdto';
import {LoanshipService} from 'src/loanship/loanship.service';
import {LoanSlip} from 'src/loanship/entities/loanship.entity';
import {Liquidation} from 'src/liquidation/entities/liquidation.entity';
import {Group} from 'src/group/entities/group.entity';
import {SearchName} from './dto/search-name.dto';
import {LibraryService} from 'src/library/library.service';

@Injectable()
export class PublicationService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: SoftDeleteModel<Publication>,
    @InjectModel(LoanSlip.name) private loanSlipModel: SoftDeleteModel<LoanSlip>,
    @InjectModel(Liquidation.name) private liquidationModel: SoftDeleteModel<Liquidation>,
    @InjectModel(Group.name) private groupModel: SoftDeleteModel<Group>,
    private readonly libraryService: LibraryService
  ) {}
  async create(createDto: CreatePublicationDto): Promise<Publication> {
    if (createDto.path == '') {
      createDto.path = '/default/publication-default.jpg';
      createDto.priviewImage = '/default/publication-default.jpg';
    }
    createDto.totalQuantity = 0;
    const pub: Publication = await this.publicationModel.findOne({barcode: createDto.barcode, libraryId: new Types.ObjectId(createDto.libraryId)});
    if (pub) {
      throw new BadRequestException('Barcode đã tồn tại!');
    }

    const pubName: Publication = await this.publicationModel.findOne({name: createDto.name, libraryId: new Types.ObjectId(createDto.libraryId)});
    if (pubName) {
      throw new BadRequestException('name already exists');
    }
    if (createDto.barcode == '') {
      createDto.barcode = undefined;
    }
    createDto.totalQuantity = 0;
    return await this.publicationModel.create(createDto);
  }

  async test() {
    const pubs = await this.publicationModel.find();
    const ids = pubs.map(pub => pub._id);
    return await this.liquidationModel.updateMany(
      {_id: {$in: ids}}, // Điều kiện lọc, chọn tất cả các tài liệu có _id nằm trong mảng ids
      {
        totalQuantity: 0, // Các trường cần cập nhật
      }
    );
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Publication>): Promise<PageDto<Publication>> {
    const {page, limit, skip, order, search} = pageOptions;
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];
    const mongoQuery: any = {};
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
    if (Object.keys(mongoQuery).includes('createBy')) {
      mongoQuery.createBy = new Types.ObjectId(mongoQuery.createBy);
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
        .populate('libraryId')
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

  async findByBarcode(barcode: string, libraryId: string): Promise<ItemDto<Publication>> {
    return new ItemDto(await this.publicationModel.findOne({barcode, libraryId: new Types.ObjectId(libraryId)}));
  }

  async findBynames(query: SearchName): Promise<ItemDto<Publication>> {
    const mongoQuery: any = {libraryId: new Types.ObjectId(query.libraryId), type: 'ấn phẩm cứng'};
    if (query.search) {
      mongoQuery.name = {$regex: new RegExp(query.search, 'i')};
    }
    return new ItemDto(await this.publicationModel.find(mongoQuery));
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
    let deletedFileSize = 0;
    // co file
    if (updateDto.path) {
      const oldImagePath = path.join(__dirname, '..', '..', 'public', resource.path);
      if (existsSync(oldImagePath) && resource.path !== '/default/publication-default.jpg') {
        deletedFileSize += statSync(oldImagePath).size; // Tính dung lượng file cũ
        unlinkSync(oldImagePath);
      }

      for (let i = 0; i < resource.images.length; i++) {
        const priviewImageOld = path.join(__dirname, '..', '..', 'public', resource.path);
        const imageConvertOld = path.join(__dirname, '..', '..', 'public', resource.images[i]);

        if (existsSync(priviewImageOld)) {
          deletedFileSize += statSync(priviewImageOld).size;
          unlinkSync(priviewImageOld);
        }

        if (existsSync(imageConvertOld)) {
          deletedFileSize += statSync(imageConvertOld).size;
          unlinkSync(imageConvertOld);
        }
      }
      await this.libraryService.updateStorageLimit(resource.libraryId.toString(), -deletedFileSize / (1024 * 1024)); // chuyển sang MB
    } else {
      updateDto.path = resource.path;
      updateDto.images = resource.images;
      updateDto.priviewImage = resource.priviewImage;
    }

    updateDto.quantity = updateDto.quantity ? +updateDto.quantity : resource.quantity;
    updateDto.shelvesQuantity = updateDto.shelvesQuantity ? +updateDto.shelvesQuantity : resource.shelvesQuantity;
    updateDto.totalQuantity = updateDto.totalQuantity ? +updateDto.totalQuantity : resource.totalQuantity;

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

  async convertPdfToImages(pdfPath: string): Promise<{files: string[]; totalSizeMB: number}> {
    try {
      const outputDir = path.join(__dirname, '../../public/images-convert');
      const outputDir2 = path.join(__dirname, '../../public');
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

      // Tính tổng dung lượng các file
      let totalSize = 0;
      for (const file of outputFiles) {
        const stats = await fs.stat(path.join(outputDir2, file));
        totalSize += stats.size; // Kích thước file tính theo byte
      }
      const totalSizeMB = totalSize / (1024 * 1024); // Chuyển sang MB
      return {files: outputFiles, totalSizeMB};
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error(error);
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
    let deletedFileSize = 0;

    const oldImagePath = path.join(__dirname, '..', '..', 'public', resource.path);
    if (existsSync(oldImagePath) && resource.path !== '/default/publication-default.jpg') {
      deletedFileSize += statSync(oldImagePath).size; // Tính dung lượng file cũ
      unlinkSync(oldImagePath);
    }

    for (let i = 0; i < resource.images.length; i++) {
      const priviewImageOld = path.join(__dirname, '..', '..', 'public', resource.path);
      const imageConvertOld = path.join(__dirname, '..', '..', 'public', resource.images[i]);

      if (existsSync(priviewImageOld)) {
        deletedFileSize += statSync(priviewImageOld).size;

        unlinkSync(priviewImageOld);
      }

      if (existsSync(imageConvertOld)) {
        deletedFileSize += statSync(imageConvertOld).size;

        unlinkSync(imageConvertOld);
      }
    }
    await this.libraryService.updateStorageLimit(resource.libraryId.toString(), deletedFileSize / (1024 * 1024)); // chuyển sang MB

    return await this.publicationModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    let deletedFileSize = 0;

    for (let i = 0; i < objectIds.length; i++) {
      const resource: Publication = await this.publicationModel.findOneDeleted(new Types.ObjectId(objectIds[i]));

      const oldImagePath = path.join(__dirname, '..', '..', 'public', resource.path);
      if (existsSync(oldImagePath)) {
        deletedFileSize += statSync(oldImagePath).size; // Tính dung lượng file cũ
        unlinkSync(oldImagePath);
      }

      for (let i = 0; i < resource.images.length; i++) {
        const priviewImageOld = path.join(__dirname, '..', '..', 'public', resource.path);
        const imageConvertOld = path.join(__dirname, '..', '..', 'public', resource.images[i]);

        if (existsSync(priviewImageOld)) {
          deletedFileSize += statSync(priviewImageOld).size;

          unlinkSync(priviewImageOld);
        }

        if (existsSync(imageConvertOld)) {
          deletedFileSize += statSync(imageConvertOld).size;

          unlinkSync(imageConvertOld);
        }
      }
      await this.libraryService.updateStorageLimit(resource.libraryId.toString(), deletedFileSize / (1024 * 1024)); // chuyển sang MB
    }
    return await this.publicationModel.deleteMany({
      _id: {$in: objectIds},
    });
  }

  async generateImageFromVideo2(videoPath: string, outputImagePath: string, time: string = '00:00:14'): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [time],
          filename: path.basename(outputImagePath), // Ensure only the filename is used, not the full path
          folder: path.dirname(outputImagePath),
        })
        .on('end', () => {
          console.log('Screenshot taken');
          resolve();
        })
        .on('error', (err: any) => {
          console.error('Error taking screenshot:', err);
          reject(err);
        });
    });
  }

  // Tính tổng số lượng sách
  async getTotalBooks(libraryId: Types.ObjectId): Promise<any> {
    const match: any = libraryId ? {libraryId: libraryId} : {};

    // Define default types to return if no documents exist
    const defaultTypes = [
      {type: 'ấn phẩm mềm', totalQuantity: 0, count: 0},
      {type: 'ấn phẩm cứng', totalQuantity: 0, count: 0},
    ];

    const result = await this.publicationModel.aggregate([
      {$match: match},
      {
        $group: {
          _id: '$type',
          totalQuantity: {
            $sum: {
              $cond: {
                if: {$eq: ['$totalQuantity', 0]},
                then: 1,
                else: '$totalQuantity',
              },
            },
          },
          count: {$sum: 1},
        },
      },
      {
        $project: {
          type: '$_id',
          totalQuantity: 1,
          count: 1,
          _id: 0,
        },
      },
      {
        $unionWith: {
          coll: this.publicationModel.collection.name,
          pipeline: [
            {
              $project: {
                type: {$literal: 'ấn phẩm mềm'}, // Ensure all default types are in result
                totalQuantity: {$literal: 0},
                count: {$literal: 0},
              },
            },
            {
              $project: {
                type: {$literal: 'ấn phẩm cứng'},
                totalQuantity: {$literal: 0},
                count: {$literal: 0},
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: '$type',
          totalQuantity: {$max: '$totalQuantity'},
          count: {$max: '$count'},
        },
      },
      {
        $project: {
          type: '$_id',
          totalQuantity: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  // sách có thể mượn totalQuantity>0 và ấn phẩm cứng
  async countBorrowableHardcoverBooks(libraryId: Types.ObjectId): Promise<any> {
    const query: any = {
      type: 'ấn phẩm cứng', // Chỉ đếm các sách là ấn phẩm cứng
      totalQuantity: {$gt: 0}, // Chỉ đếm các sách có totalQuantity > 0
    };

    if (libraryId) {
      query.libraryId = libraryId; // Thêm libraryId vào truy vấn nếu có
    }

    const count = await this.publicationModel.countDocuments(query);
    return count;
  }

  //liên thông
  async GetIsLink(libraryId: string, pageOptions: PageOptionsDto, query: Partial<Publication>): Promise<any> {
    const {page, limit, skip, order, search} = pageOptions;
    const group = await this.groupModel.findOne({
      libraries: {$in: [libraryId]},
    });
    if (!group) {
      throw new BadRequestException('Thư viện chưa có trong nhóm');
    }

    const groupId = group._id;
    // Thêm các điều kiện từ `query` và search
    const searchRegex = search
      ? {$regex: search, $options: 'i'} // 'i' để không phân biệt hoa thường
      : null;
    const mongoQuery: any = {isLink: true};
    const pagination = ['page', 'limit', 'skip', 'order', 'search'];

    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery = Object.keys(query);
      arrayQuery.forEach(key => {
        if (key && !pagination.includes(key)) {
          mongoQuery[key] = query[key];
        }
      });
    }
    if (Object.keys(mongoQuery).includes('libraryId')) {
      mongoQuery.libraryId = new Types.ObjectId(mongoQuery.libraryId);
    }
    const match = {
      ...(searchRegex && {name: searchRegex}),
      ...mongoQuery,
    };

    // truy vấn

    const results = await this.publicationModel.aggregate([
      {
        $match: {
          ...match,
        },
      },
      {
        $lookup: {
          from: 'libraries', // Tên của collection thư viện
          localField: 'libraryId', // Trường libraryId của bảng ấn phẩm
          foreignField: '_id', // Trường _id của bảng thư viện
          as: 'libraryDetails', // Tên trường chứa dữ liệu kết nối
        },
      },
      //chuyển đổi các mảng thành ObId
      {
        $addFields: {
          authorIds: {
            $map: {
              input: '$authorIds',
              as: 'id',
              in: {$toObjectId: '$$id'}, // Chuyển đổi từng `authorId` sang `ObjectId`
            },
          },
        },
      },
      {
        $addFields: {
          categoryIds: {
            $map: {
              input: '$categoryIds',
              as: 'id',
              in: {$toObjectId: '$$id'}, // Chuyển đổi từng `authorId` sang `ObjectId`
            },
          },
        },
      },
      {
        $addFields: {
          publisherIds: {
            $map: {
              input: '$publisherIds',
              as: 'id',
              in: {$toObjectId: '$$id'}, // Chuyển đổi từng `authorId` sang `ObjectId`
            },
          },
        },
      },
      {
        $addFields: {
          materialIds: {
            $map: {
              input: '$materialIds',
              as: 'id',
              in: {$toObjectId: '$$id'}, // Chuyển đổi từng `authorId` sang `ObjectId`
            },
          },
        },
      },
      {
        $addFields: {
          materials: {
            $map: {
              input: '$materials',
              as: 'id',
              in: {$toObjectId: '$$id'}, // Chuyển đổi từng `authorId` sang `ObjectId`
            },
          },
        },
      },
      {
        $addFields: {
          shelvesId: {
            $toObjectId: '$shelvesId', // Chuyển đổi từng `authorId` sang `ObjectId`
          },
        },
      },
      //tìm trong các mảng lieenm kết tới bảng

      {
        $lookup: {
          from: 'authors', // Giả sử bạn muốn populate thêm thông tin tác giả
          localField: 'authorIds', // Trường liên kết của bảng `material`
          foreignField: '_id', // Trường `_id` của bảng `authors`
          as: 'authorIds',
        },
      },
      {
        $lookup: {
          from: 'categories', // Giả sử bạn muốn populate thêm thông tin tác giả
          localField: 'categoryIds', // Trường liên kết của bảng `material`
          foreignField: '_id', // Trường `_id` của bảng `authors`
          as: 'categoryIds',
        },
      },
      {
        $lookup: {
          from: 'publishers', // Giả sử bạn muốn populate thêm thông tin tác giả
          localField: 'publisherIds', // Trường liên kết của bảng `material`
          foreignField: '_id', // Trường `_id` của bảng `authors`
          as: 'publisherIds',
        },
      },
      {
        $lookup: {
          from: 'materials', // Giả sử bạn muốn populate thêm thông tin tác giả
          localField: 'materialIds', // Trường liên kết của bảng `material`
          foreignField: '_id', // Trường `_id` của bảng `authors`
          as: 'materialIds',
        },
      },
      {
        $lookup: {
          from: 'shelves', // Giả sử bạn muốn populate thêm thông tin tác giả
          localField: 'shelvesId', // Trường liên kết của bảng `material`
          foreignField: '_id', // Trường `_id` của bảng `authors`
          as: 'shelvesId',
        },
      },
      {
        $unwind: {
          path: '$libraryDetails',
          preserveNullAndEmptyArrays: true, // Giữ lại tài liệu nếu abc là null hoặc không tồn tại
        },
      },

      {
        $match: {
          'libraryDetails.groupId': groupId, // Điều kiện groupId
        },
      },
      {
        $sort: {createdAt: order === 'ASC' ? 1 : -1}, // Sắp xếp theo createdAt
      },
      {
        $skip: skip, // Bỏ qua các tài liệu đã phân trang
      },
      {
        $limit: limit, // Giới hạn số tài liệu trả về
      },
    ]);

    // Đếm tổng số tài liệu khớp với điều kiện
    const countResult = await this.publicationModel.aggregate([
      {
        $match: {
          ...match,
        },
      },
      {
        $lookup: {
          from: 'libraries',
          localField: 'libraryId',
          foreignField: '_id',
          as: 'libraryDetails',
        },
      },
      {
        $unwind: {
          path: '$libraryDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'libraryDetails.groupId': groupId,
        },
      },
      {
        $count: 'totalCount', // Đếm số tài liệu
      },
    ]);

    const itemCount = countResult.length > 0 ? countResult[0].totalCount : 0;
    console.log(itemCount);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount: itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }
}
