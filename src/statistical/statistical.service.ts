import {Injectable} from '@nestjs/common';
import {LoanshipService} from 'src/loanship/loanship.service';
import {PublicationService} from 'src/publication/publication.service';

@Injectable()
export class StatisticalService {
  constructor(
    private readonly loanshipService: LoanshipService,
    private readonly publicationService: PublicationService
  ) {}

  // Tính tổng số lượng sách
  async statisticalPublication() {
    const totalPublication = await this.publicationService.getTotalBooks();
    const countBorrowable = await this.publicationService.countBorrowableHardcoverBooks();
    const topPuliction = await this.loanshipService.getTopBorrowedBooksInMonth();
    const totalBorrowedBooks = await this.loanshipService.getTotalBorrowedBooks();
    const totalReturnedBooks = await this.loanshipService.getTotalReturnedBooks();
    const totalOverdueLoans = await this.loanshipService.getTotalOverdueLoans();
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
