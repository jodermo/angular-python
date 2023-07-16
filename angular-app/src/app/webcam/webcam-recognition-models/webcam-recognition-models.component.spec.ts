import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamRecognitionModelsComponent } from './webcam-recognition-models.component';

describe('WebcamRecognitionModelsComponent', () => {
  let component: WebcamRecognitionModelsComponent;
  let fixture: ComponentFixture<WebcamRecognitionModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebcamRecognitionModelsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebcamRecognitionModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
