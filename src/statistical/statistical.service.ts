import {Injectable} from '@nestjs/common';
import {LoanshipService} from 'src/loanship/loanship.service';
import {PublicationService} from 'src/publication/publication.service';

@Injectable()
export class StatisticalService {
  constructor(
    private readonly loanshipService: LoanshipService,
    private readonly publicationService: PublicationService
  ) {}
}
