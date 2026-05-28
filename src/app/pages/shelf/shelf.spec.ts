import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shelf } from './shelf';

describe('Shelf', () => {
  let component: Shelf;
  let fixture: ComponentFixture<Shelf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shelf],
    }).compileComponents();

    fixture = TestBed.createComponent(Shelf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
