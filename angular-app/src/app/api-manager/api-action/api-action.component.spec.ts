import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiActionComponent } from './api-action.component';

describe('ApiActionComponent', () => {
  let component: ApiActionComponent;
  let fixture: ComponentFixture<ApiActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
