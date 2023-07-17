import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechRecognitionInfoComponent } from './speech-recognition-info.component';

describe('SpeechRecognitionInfoComponent', () => {
  let component: SpeechRecognitionInfoComponent;
  let fixture: ComponentFixture<SpeechRecognitionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeechRecognitionInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechRecognitionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
