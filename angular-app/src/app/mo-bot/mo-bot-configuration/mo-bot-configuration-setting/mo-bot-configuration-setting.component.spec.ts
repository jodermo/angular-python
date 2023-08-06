import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoBotConfigurationSettingComponent } from './mo-bot-configuration-setting.component';

describe('MoBotConfigurationSettingComponent', () => {
  let component: MoBotConfigurationSettingComponent;
  let fixture: ComponentFixture<MoBotConfigurationSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoBotConfigurationSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoBotConfigurationSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
