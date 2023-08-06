import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoBotConfigurationComponent } from './mo-bot-configuration.component';

describe('MoBotConfigurationComponent', () => {
  let component: MoBotConfigurationComponent;
  let fixture: ComponentFixture<MoBotConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoBotConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoBotConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
