import {Test, TestingModule} from '@nestjs/testing';
import {CodeForgotService} from './code-forgot.service';

describe('CodeForgotService', () => {
  let service: CodeForgotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeForgotService],
    }).compile();

    service = module.get<CodeForgotService>(CodeForgotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
