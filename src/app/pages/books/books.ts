import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';

import { Api } from '../../services/api';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.html',
  styleUrl: './books.css'
})
export class Books implements OnInit {

  books: any[] = [];
  searchText = '';

  showViewModal = false;
  selectedBook: any = null;
  rackShelfSummary: any[] = [];

  constructor(
    private api: Api,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.api.getBooks().subscribe({
      next: (data: any) => {
        this.books = Array.isArray(data)
          ? data
          : (data?.$values || []);

        this.books.sort((a: any, b: any) => {
          const idA = Number(a.id || a.Id || 0);
          const idB = Number(b.id || b.Id || 0);
          return idA - idB;
        });
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load books');
      }
    });
  }

  get filteredBooks() {
    const search = this.searchText.toLowerCase();

    return this.books.filter((x: any) =>
      this.getCustomBarcode(x).toLowerCase().includes(search) ||
      this.getTitle(x).toLowerCase().includes(search) ||
      this.getAuthor(x).toLowerCase().includes(search) ||
      this.getPublisher(x).toLowerCase().includes(search) ||
      this.getLanguage(x).toLowerCase().includes(search) ||
      this.getCategory(x).toLowerCase().includes(search) ||
      this.getTotalCopies(x).toString().includes(search) ||
      this.getAvailableCopies(x).toString().includes(search)
    );
  }

  exportExcel(): void {
    const requests = this.filteredBooks.map((book: any) => {
      const bookId = book.id || book.Id;

      return this.http
        .get<any[]>(`https://localhost:7126/api/Books/${bookId}/rack-shelf-summary`)
        .pipe(catchError(() => of([])));
    });

    forkJoin(requests).subscribe((summaryResults: any[]) => {
      const exportData: any[] = [];

      this.filteredBooks.forEach((book: any, index: number) => {
        const summary = Array.isArray(summaryResults[index])
          ? summaryResults[index]
          : (summaryResults[index]?.$values || []);

        if (summary.length === 0) {
          exportData.push({
            ID: book.id || book.Id,
            'Custom Barcode': this.getCustomBarcode(book),
            Title: this.getTitle(book),
            Author: this.getAuthor(book),
            Publisher: this.getPublisher(book),
            Language: this.getLanguage(book),
            Category: this.getCategory(book),
            'Total Count': this.getTotalCopies(book),
            'Available Count': this.getAvailableCopies(book),
            'Created On Date': this.getCreatedDate(book),
            Shelf: '',
            Rack: '',
            'Shelf/Rack Total Count': '',
            'Shelf/Rack Available Count': ''
          });
        } else {
          summary.forEach((item: any) => {
            exportData.push({
              ID: book.id || book.Id,
              'Custom Barcode': this.getCustomBarcode(book),
              Title: this.getTitle(book),
              Author: this.getAuthor(book),
              Publisher: this.getPublisher(book),
              Language: this.getLanguage(book),
              Category: this.getCategory(book),
              'Total Count': this.getTotalCopies(book),
              'Available Count': this.getAvailableCopies(book),
              'Created On Date': this.getCreatedDate(book),
              Shelf: this.getSummaryShelf(item),
              Rack: this.getSummaryRack(item),
              'Shelf/Rack Total Count': this.getSummaryTotal(item),
              'Shelf/Rack Available Count': this.getSummaryAvailable(item)
            });
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');

      XLSX.writeFile(workbook, 'Books_Report.xlsx');
    });
  }

  viewBook(book: any): void {
    this.selectedBook = book;

    const bookId = book.id || book.Id;

    this.http.get<any[]>(
      `https://localhost:7126/api/Books/${bookId}/rack-shelf-summary`
    ).subscribe({
      next: (data: any) => {
        this.rackShelfSummary = Array.isArray(data)
          ? data
          : (data?.$values || []);

        this.showViewModal = true;
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load rack/shelf summary');
      }
    });
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedBook = null;
    this.rackShelfSummary = [];
  }

  getCustomBarcode(book: any): string {
    return book?.customBarcode || book?.CustomBarcode || '';
  }

  getTitle(book: any): string {
    return book?.title || book?.Title || '';
  }

  getAuthor(book: any): string {
    return book?.authorName || book?.AuthorName || '';
  }

  getPublisher(book: any): string {
    return book?.publisherName || book?.PublisherName || '';
  }

  getLanguage(book: any): string {
    return book?.languageName || book?.LanguageName || '';
  }

  getCategory(book: any): string {
    return book?.categoryName || book?.CategoryName || '';
  }

  getCreatedDate(book: any): string {
    const value = book?.createdDate || book?.CreatedDate;

    if (!value) return '';

    const date = new Date(value);

    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-GB');
  }

  getTotalCopies(book: any): number {
    return book?.totalCopies || book?.TotalCopies || 0;
  }

  getAvailableCopies(book: any): number {
    return book?.availableCopies || book?.AvailableCopies || 0;
  }

  getSummaryShelf(item: any): string {
    return item?.shelfName || item?.ShelfName || '';
  }

  getSummaryRack(item: any): string {
    return item?.rackName || item?.RackName || '';
  }

  getSummaryTotal(item: any): number {
    return item?.totalCount || item?.TotalCount || 0;
  }

  getSummaryAvailable(item: any): number {
    return item?.availableCount || item?.AvailableCount || 0;
  }
}