import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechRecognitionButtonComponent } from './speech-recognition-button.component';

describe('SpeechRecognitionButtonComponent', () => {
  let component: SpeechRecognitionButtonComponent;
  let fixture: ComponentFixture<SpeechRecognitionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeechRecognitionButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechRecognitionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
