import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenFileComponent } from './fullscreen-file.component';

describe('FullscreenFileComponent', () => {
  let component: FullscreenFileComponent;
  let fixture: ComponentFixture<FullscreenFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullscreenFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullscreenFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
