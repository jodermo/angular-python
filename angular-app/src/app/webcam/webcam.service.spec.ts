import { TestBed } from '@angular/core/testing';

import { WebcamService } from './webcam.service';

describe('WebcamService', () => {
  let service: WebcamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebcamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
