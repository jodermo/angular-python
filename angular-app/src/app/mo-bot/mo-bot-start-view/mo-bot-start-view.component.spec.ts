import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoBotStartViewComponent } from './mo-bot-start-view.component';

describe('MoBotStartViewComponent', () => {
  let component: MoBotStartViewComponent;
  let fixture: ComponentFixture<MoBotStartViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoBotStartViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoBotStartViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
