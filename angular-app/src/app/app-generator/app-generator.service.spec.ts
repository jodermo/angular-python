import { TestBed } from '@angular/core/testing';

import { AppGeneratorService } from './app-generator.service';

describe('AppGeneratorService', () => {
  let service: AppGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
