import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoBotComponent } from './mo-bot.component';

describe('MoBotComponent', () => {
  let component: MoBotComponent;
  let fixture: ComponentFixture<MoBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoBotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
