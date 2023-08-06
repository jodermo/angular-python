import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamErrorComponent } from './webcam-error.component';

describe('WebcamErrorComponent', () => {
  let component: WebcamErrorComponent;
  let fixture: ComponentFixture<WebcamErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebcamErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebcamErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
