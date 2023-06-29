import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParsedMessageComponent } from './parsed-message.component';

describe('ParsedMessageComponent', () => {
  let component: ParsedMessageComponent;
  let fixture: ComponentFixture<ParsedMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParsedMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParsedMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
