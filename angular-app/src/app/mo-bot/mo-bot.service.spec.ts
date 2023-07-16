import { TestBed } from '@angular/core/testing';

import { MoBotService } from './mo-bot.service';

describe('MoBotService', () => {
  let service: MoBotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoBotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
