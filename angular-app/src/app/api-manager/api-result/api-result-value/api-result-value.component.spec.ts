import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiResultValueComponent } from './api-result-value.component';

describe('ApiResultValueComponent', () => {
  let component: ApiResultValueComponent;
  let fixture: ComponentFixture<ApiResultValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiResultValueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiResultValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
