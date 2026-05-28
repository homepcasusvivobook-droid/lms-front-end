import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rack } from './rack';

describe('Rack', () => {
  let component: Rack;
  let fixture: ComponentFixture<Rack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rack],
    }).compileComponents();

    fixture = TestBed.createComponent(Rack);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
