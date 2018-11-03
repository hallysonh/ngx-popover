import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPopoverDirective } from './ngx-popover.directive';

describe('NgxPopoverComponent', () => {
  let component: NgxPopoverDirective;
  let fixture: ComponentFixture<NgxPopoverDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxPopoverDirective],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxPopoverDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
