import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamMarkerComponent } from './webcam-marker.component';

describe('WebcamMarkerComponent', () => {
  let component: WebcamMarkerComponent;
  let fixture: ComponentFixture<WebcamMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebcamMarkerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebcamMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
