import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Masters } from './masters';

describe('Masters', () => {
  let component: Masters;
  let fixture: ComponentFixture<Masters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Masters],
    }).compileComponents();

    fixture = TestBed.createComponent(Masters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
