import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextToSpeechButtonComponent } from './text-to-speech-button.component';

describe('TextToSpeechButtonComponent', () => {
  let component: TextToSpeechButtonComponent;
  let fixture: ComponentFixture<TextToSpeechButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextToSpeechButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextToSpeechButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
