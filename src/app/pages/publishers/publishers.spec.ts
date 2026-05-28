import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Publishers } from './publishers';

describe('Publishers', () => {
  let component: Publishers;
  let fixture: ComponentFixture<Publishers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Publishers],
    }).compileComponents();

    fixture = TestBed.createComponent(Publishers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
