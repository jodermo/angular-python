import { TestBed } from '@angular/core/testing';

import { AppWidgetsService } from './app-widgets.service';

describe('AppWidgetsService', () => {
  let service: AppWidgetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppWidgetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
