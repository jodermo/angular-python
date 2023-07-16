import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamRecordComponent } from './webcam-record.component';

describe('WebcamRecordComponent', () => {
  let component: WebcamRecordComponent;
  let fixture: ComponentFixture<WebcamRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebcamRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebcamRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
