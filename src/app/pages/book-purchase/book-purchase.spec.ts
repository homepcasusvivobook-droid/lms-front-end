import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookPurchase } from './book-purchase';

describe('BookPurchase', () => {
  let component: BookPurchase;
  let fixture: ComponentFixture<BookPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookPurchase],
    }).compileComponents();

    fixture = TestBed.createComponent(BookPurchase);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
