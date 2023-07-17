import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioAnalyzerComponent } from './audio-analyzer.component';

describe('AudioAnalyzerComponent', () => {
  let component: AudioAnalyzerComponent;
  let fixture: ComponentFixture<AudioAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioAnalyzerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
