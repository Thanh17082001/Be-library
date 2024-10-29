import {Injectable} from '@nestjs/common';
import { Types } from 'mongoose';
import {LoanshipService} from 'src/loanship/loanship.service';
import {PublicationService} from 'src/publication/publication.service';

@Injectable()
export class StatisticalService {
  constructor(
    private readonly loanshipService: LoanshipService,
    private readonly publicationService: PublicationService
  ) {}

  // Tính tổng số lượng sách
  async statisticalPublication(libraryId?: Types.ObjectId) {
    const totalPublication = await this.publicationService.getTotalBooks(libraryId);
    const countBorrowable = await this.publicationService.countBorrowableHardcoverBooks(libraryId);
    const topPuliction = await this.loanshipService.getTopBorrowedBooksInMonth(libraryId);
    const totalBorrowedBooks = await this.loanshipService.getTotalBorrowedBooks(libraryId);
    const totalReturnedBooks = await this.loanshipService.getTotalReturnedBooks(libraryId);
    const totalOverdueLoans = await this.loanshipService.getTotalOverdueLoans(libraryId);
    const result = {
      totalPublication: totalPublication,
      totalBorrowable: countBorrowable,
      TopBorrowedBooksInMonth: topPuliction,
      totalBorrowedBooks: totalBorrowedBooks,
      totalReturnedBooks: totalReturnedBooks,
      totalOverdueLoans: totalOverdueLoans,
    };
    return {
      result,
    };
  }
}
