import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiResultComponent } from './api-result.component';

describe('ApiResultComponent', () => {
  let component: ApiResultComponent;
  let fixture: ComponentFixture<ApiResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
