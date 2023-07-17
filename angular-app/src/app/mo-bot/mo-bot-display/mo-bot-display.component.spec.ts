import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoBotDisplayComponent } from './mo-bot-display.component';

describe('MoBotDisplayComponent', () => {
  let component: MoBotDisplayComponent;
  let fixture: ComponentFixture<MoBotDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoBotDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoBotDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
