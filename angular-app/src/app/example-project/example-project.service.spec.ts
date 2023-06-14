import { TestBed } from '@angular/core/testing';

import { ExampleProjectService } from './example-project.service';

describe('ExampleProjectService', () => {
  let service: ExampleProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExampleProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
