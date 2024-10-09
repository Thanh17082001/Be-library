import {CreateLoanshipDto} from './dto/create-loanship.dto';
import {UpdateLoanshipDto} from './dto/update-loanship.dto';
import {Injectable, NotFoundException, BadRequestException, HttpException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, ObjectId, Types} from 'mongoose';
import {PageOptionsDto} from 'src/utils/page-option-dto';
import {ItemDto, PageDto} from 'src/utils/page.dto';
import {PageMetaDto} from 'src/utils/page.metadata.dto';
import {SoftDeleteModel} from 'mongoose-delete';
import {LoanSlip} from './entities/loanship.entity';
import {PublicationService} from 'src/publication/publication.service';
import {generateBarcode} from 'src/common/genegrate-barcode';

@Injectable()
export class LoanshipService {
  constructor(
    @InjectModel(LoanSlip.name) private loanSlipModel: SoftDeleteModel<LoanSlip>,
    private publicationService: PublicationService
  ) {}
  async create(createDto: CreateLoanshipDto): Promise<LoanSlip> {
    createDto.barcode = generateBarcode();
    const result = await this.loanSlipModel.create(createDto);
    return result;
  }
  async agreeToLoan(id: string): Promise<any> {
    const loan = await this.loanSlipModel.findById(new Types.ObjectId(id));
    if (loan.isAgree) {
      throw new BadRequestException('loan already agree');
    }
    if (!loan) {
      throw new NotFoundException('Resource not found');
    }
    const publications = loan.publications;
    const error = [];
    for (let i = 0; i < publications.length; i++) {
      const publicationId = publications[i].publicationId;
      const publication = await this.publicationService.findById(publicationId);
      let loanQuantityed = publication.shelvesQuantity - publications[i].quantityLoan;
      let data = {};
      console.log(publications[i].position);
      if (publications[i].position == 'stock') {
        console.log('object');
        loanQuantityed = publication.quantity - publications[i].quantityLoan;
        if (loanQuantityed <= 0) {
          error.push({
            publicationId: publicationId,
            message: `Not enough quantity : ${publicationId}`,
          });
        }
        data = {quantity: loanQuantityed};
      } else {
        if (loanQuantityed <= 0) {
          error.push({
            publicationId: publicationId,
            message: `Not enough quantity: ${publicationId}`,
          });
        }
        data = {shelvesQuantity: loanQuantityed};
      }
      if (error.length > 0) {
        console.log(error);
        throw new HttpException(error, 400);
      }
      await this.publicationService.update(publicationId.toString(), data);
    }
    return await this.loanSlipModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      {isAgree: true, status: 'đã duyệt'},
      {
        returnDocument: 'after',
      }
    );
  }

  async returnToLoan(id: string): Promise<any> {
    const loan = await this.loanSlipModel.findById(new Types.ObjectId(id));
    if (loan.isReturn) {
      throw new BadRequestException('books already return');
    }
    if (!loan) {
      throw new NotFoundException('Resource not found');
    }
    const publications = loan.publications;
    const error = [];
    for (let i = 0; i < publications.length; i++) {
      const publicationId = publications[i].publicationId;
      const publication = await this.publicationService.findById(publicationId);
      let loanQuantityed = publication.shelvesQuantity + publications[i].quantityLoan;
      let data = {};
      if (publications[i].position == 'stock') {
        loanQuantityed = publication.quantity + publications[i].quantityLoan;
        if (loanQuantityed <= 0) {
          error.push({
            publicationId: publicationId,
            message: `Not enough quantity : ${publicationId}`,
          });
        }
        data = {quantity: loanQuantityed};
      } else {
        if (loanQuantityed <= 0) {
          error.push({
            publicationId: publicationId,
            message: `Not enough quantity: ${publicationId}`,
          });
        }
        data = {shelvesQuantity: loanQuantityed};
      }
      if (error.length > 0) {
        throw new HttpException(error, 400);
      }
      await this.publicationService.update(publicationId.toString(), data);
    }
    return await this.loanSlipModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      {isReturn: true, status: 'đã trả sách'},
      {
        returnDocument: 'after',
      }
    );
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<LoanSlip>): Promise<PageDto<LoanSlip>> {
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
      this.loanSlipModel
        .find(mongoQuery)
        .populate('publications.publicationId')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.loanSlipModel.countDocuments(mongoQuery),
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });
    return new PageDto(results, pageMetaDto);
  }

  async findOne(id: Types.ObjectId): Promise<ItemDto<LoanSlip>> {
    return new ItemDto(await this.loanSlipModel.findById(id));
  }

  async update(id: string, updateDto: UpdateLoanshipDto): Promise<LoanSlip> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    // const exits: LoanSlip = await this.loanSlipModel.findOne({
    //   name: updateDto.name, // Tìm theo tên
    //   _id: { $ne: new Types.ObjectId(id) }, // Loại trừ ID hiện tại
    // });
    // if (exits) {
    //   throw new BadRequestException('name already exists');
    // }
    const resource: LoanSlip = await this.loanSlipModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return this.loanSlipModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string): Promise<LoanSlip> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: LoanSlip = await this.loanSlipModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.loanSlipModel?.deleteById(new Types.ObjectId(id));
  }

  async removes(ids: string[]): Promise<Array<LoanSlip>> {
    const arrResult: LoanSlip[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = new Types.ObjectId(ids[i]);
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }
      const resource: LoanSlip = await this.loanSlipModel.findById(id);
      if (!resource) {
        throw new NotFoundException('Resource not found');
      }
      const result = await this.loanSlipModel.deleteById(id);
      arrResult.push(result);
    }
    return arrResult;
  }

  async findDeleted(pageOptions: PageOptionsDto, query: Partial<LoanSlip>): Promise<PageDto<LoanSlip>> {
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
      this.loanSlipModel
        .findDeleted(mongoQuery) // Sử dụng phương thức `findDeleted` từ mongoose-delete
        .populate('publications.publicationId')
        .sort({order: 1, createdAt: order === 'ASC' ? 1 : -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(), // Nhớ gọi .exec() để thực hiện truy vấn
      this.loanSlipModel.countDocumentsDeleted(mongoQuery), // Đếm số lượng tài liệu đã bị xóa
    ]);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: pageOptions,
      itemCount,
    });

    return new PageDto(results, pageMetaDto);
  }

  async findByIdDeleted(id: Types.ObjectId): Promise<ItemDto<LoanSlip>> {
    return new ItemDto(await this.loanSlipModel.findOneDeleted({_id: new Types.ObjectId(id)}));
  }

  async restoreByIds(ids: string[]): Promise<LoanSlip[]> {
    const restoredDocuments = await this.loanSlipModel.restore({_id: {$in: ids}});

    // Kiểm tra xem có tài liệu nào được khôi phục hay không
    if (!restoredDocuments || restoredDocuments.length === 0) {
      throw new NotFoundException(`No documents found for the provided IDs`);
    }
    await this.loanSlipModel.updateMany({_id: {$in: ids}}, {$set: {deleted: false}});

    return restoredDocuments;
  }

  async delete(id: string): Promise<LoanSlip> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const resource: LoanSlip = await this.loanSlipModel.findById(new Types.ObjectId(id));
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return await this.loanSlipModel?.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteMultiple(ids: string[]): Promise<any> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    return await this.loanSlipModel.deleteMany({
      _id: {$in: objectIds},
    });
  }
}
