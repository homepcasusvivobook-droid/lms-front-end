import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberTypes } from './member-types';

describe('MemberTypes', () => {
  let component: MemberTypes;
  let fixture: ComponentFixture<MemberTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
