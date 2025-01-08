import { Test, TestingModule } from '@nestjs/testing';
import { CodeForgotController } from './code-forgot.controller';
import { CodeForgotService } from './code-forgot.service';

describe('CodeForgotController', () => {
  let controller: CodeForgotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeForgotController],
      providers: [CodeForgotService],
    }).compile();

    controller = module.get<CodeForgotController>(CodeForgotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
