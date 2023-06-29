import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppWidgetsComponent } from './app-widgets.component';

describe('AppWidgetsComponent', () => {
  let component: AppWidgetsComponent;
  let fixture: ComponentFixture<AppWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppWidgetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
