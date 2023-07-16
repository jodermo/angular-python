import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamRecognitionModelComponent } from './webcam-recognition-model.component';

describe('WebcamRecognitionModelComponent', () => {
  let component: WebcamRecognitionModelComponent;
  let fixture: ComponentFixture<WebcamRecognitionModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebcamRecognitionModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebcamRecognitionModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
