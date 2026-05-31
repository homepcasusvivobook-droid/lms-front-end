import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';

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
  selectedCategory = 'All';

  showViewModal = false;
  selectedBook: any = null;
  rackShelfSummary: any[] = [];

  showBarcodeReprintModal = false;
  bookCopiesForReprint: any[] = [];
  barcodeSearchText = '';
  selectedBarcodeBookId: any = '';
  selectedBookCopyId: any = '';
  selectedBarcodeCopies: any[] = [];
  showBarcodeSuggestions = false;

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

        this.books.sort((a: any, b: any) =>
          Number(b.id || b.Id || 0) - Number(a.id || a.Id || 0)
        );
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load books');
      }
    });
  }

  get categories(): string[] {
    const list = this.books
      .map((x: any) => this.getCategory(x))
      .filter((x: string) => x);

    return ['All', ...Array.from(new Set(list)).sort()];
  }

  get filteredBooks() {
    const search = this.searchText.toLowerCase();

    return this.books.filter((x: any) => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        this.getCategory(x) === this.selectedCategory;

      const matchesSearch =
        this.getISBN(x).toLowerCase().includes(search) ||
        this.getCustomBarcode(x).toLowerCase().includes(search) ||
        this.getTitle(x).toLowerCase().includes(search) ||
        this.getAuthor(x).toLowerCase().includes(search) ||
        this.getPublisher(x).toLowerCase().includes(search) ||
        this.getLanguage(x).toLowerCase().includes(search) ||
        this.getCategory(x).toLowerCase().includes(search) ||
        this.getTotalCopies(x).toString().includes(search) ||
        this.getAvailableCopies(x).toString().includes(search);

      return matchesCategory && matchesSearch;
    });
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
            ISBN: this.getISBN(book),
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
              ISBN: this.getISBN(book),
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

  openBarcodeReprintModal(): void {
    this.barcodeSearchText = '';
    this.selectedBarcodeBookId = '';
    this.selectedBookCopyId = '';
    this.selectedBarcodeCopies = [];
    this.showBarcodeSuggestions = false;

    this.api.getBookCopiesForReprint().subscribe({
      next: (res: any) => {
        this.bookCopiesForReprint = Array.isArray(res)
          ? res
          : (res?.$values || []);

        this.showBarcodeReprintModal = true;
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load book copies');
      }
    });
  }

  closeBarcodeReprintModal(): void {
    this.showBarcodeReprintModal = false;
    this.barcodeSearchText = '';
    this.selectedBarcodeBookId = '';
    this.selectedBookCopyId = '';
    this.selectedBarcodeCopies = [];
    this.showBarcodeSuggestions = false;
  }

  get filteredBookSearchResults() {
    const search = this.barcodeSearchText.toLowerCase().trim();

    if (!search) {
      return [];
    }

    const bookMap = new Map<number, any>();

    this.bookCopiesForReprint.forEach((copy: any) => {
      const bookId = copy.bookId || copy.BookId || 0;

      const matches =
        this.getCopyISBN(copy).toLowerCase().includes(search) ||
        this.getCopyTitle(copy).toLowerCase().includes(search) ||
        this.getCopyBarcode(copy).toLowerCase().includes(search) ||
        this.getCopyCustomBarcode(copy).toLowerCase().includes(search);

      if (matches && bookId > 0 && !bookMap.has(bookId)) {
        bookMap.set(bookId, copy);
      }
    });

    return Array.from(bookMap.values());
  }

  get filteredBookCopiesForReprint() {
    if (!this.selectedBarcodeBookId) {
      return [];
    }

    return this.bookCopiesForReprint.filter((x: any) =>
      Number(x.bookId || x.BookId || 0) === Number(this.selectedBarcodeBookId)
    );
  }

  onBarcodeSearchChange(): void {
    this.selectedBarcodeBookId = '';
    this.selectedBookCopyId = '';
    this.showBarcodeSuggestions = this.barcodeSearchText.trim().length > 0;
  }

  selectBarcodeSearchItem(copy: any): void {
    this.selectedBarcodeBookId = copy.bookId || copy.BookId || '';

    this.barcodeSearchText =
      `${this.getCopyTitle(copy)} | ISBN: ${this.getCopyISBN(copy)}`;

    this.selectedBookCopyId = '';
    this.showBarcodeSuggestions = false;
  }

  addBarcodeCopy(): void {
    if (!this.selectedBookCopyId) {
      alert('Select Book Copy');
      return;
    }

    const copy = this.bookCopiesForReprint.find((x: any) =>
      Number(this.getCopyId(x)) === Number(this.selectedBookCopyId)
    );

    if (!copy) {
      alert('Invalid Book Copy');
      return;
    }

    const alreadyAdded = this.selectedBarcodeCopies.find((x: any) =>
      Number(this.getCopyId(x)) === Number(this.getCopyId(copy))
    );

    if (alreadyAdded) {
      alert('This book copy already added');
      return;
    }

    this.selectedBarcodeCopies.push(copy);
    this.selectedBookCopyId = '';
  }

  removeBarcodeCopy(index: number): void {
    this.selectedBarcodeCopies.splice(index, 1);
  }

  printSelectedBarcodes(): void {
    if (this.selectedBarcodeCopies.length === 0) {
      alert('Please add at least one book copy');
      return;
    }

    let labelsHtml = '';

    this.selectedBarcodeCopies.forEach((copy: any) => {
      const barcode = this.getCopyBarcode(copy);
      const title = this.getCopyTitle(copy);

      for (let i = 0; i < 3; i++) {
        labelsHtml += `
          <div class="barcode-label">
            <div class="library-name">St. Thomas OCYM Library, Dubai</div>
            <div class="barcode-number">${barcode}</div>
            <svg class="barcode-svg" data-barcode="${barcode}"></svg>
            <div class="book-title">${title}</div>
          </div>
        `;
      }
    });

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Popup blocked. Please allow popups.');
      return;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>Print Barcode</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }

          .sheet {
            display: grid;
            grid-template-columns: repeat(3, 59mm);
            column-gap: 9.5mm;
            row-gap: 5.8mm;
          }

          .barcode-label {
            border: 1px solid #000;
            width: 59mm;
            height: 29mm;
            padding: 1.5mm;
            box-sizing: border-box;
            text-align: center;
            overflow: hidden;
          }

          .library-name {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 0.5mm;
          }

          .barcode-number {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 0.5mm;
          }

          .barcode-svg {
            width: 100%;
            height: 10mm;
          }

          .book-title {
            font-size: 8px;
            margin-top: 0.5mm;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="no-print" style="margin:10px; text-align:center;">
          <button
            onclick="window.print()"
            style="
              padding:10px 24px;
              font-size:16px;
              background:#2563eb;
              color:white;
              border:none;
              border-radius:6px;
              cursor:pointer;
              font-weight:bold;
            ">
            Print Barcode
          </button>
        </div>

        <div class="sheet">
          ${labelsHtml}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      const svgList = printWindow.document.querySelectorAll('.barcode-svg');

      svgList.forEach((svg: any) => {
        const value = svg.getAttribute('data-barcode');

        JsBarcode(svg, value, {
          format: 'CODE128',
          displayValue: false,
          margin: 0,
          height: 38
        });
      });
    }, 500);
  }

  getISBN(book: any): string {
    return book?.isbn || book?.ISBN || '';
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
    return this.getCleanName(item?.shelfName || item?.ShelfName || '');
  }

  getSummaryRack(item: any): string {
    return this.getCleanName(item?.rackName || item?.RackName || '');
  }

  getCleanName(value: string): string {
    if (!value) return '';

    const parts = value.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : value;
  }

  getSummaryTotal(item: any): number {
    return item?.totalCount || item?.TotalCount || 0;
  }

  getSummaryAvailable(item: any): number {
    return item?.availableCount || item?.AvailableCount || 0;
  }

  getCopyId(copy: any): number {
    return copy?.copyId || copy?.CopyId || 0;
  }

  getCopyBarcode(copy: any): string {
    return copy?.barcode || copy?.Barcode || '';
  }

  getCopyISBN(copy: any): string {
    return copy?.isbn || copy?.ISBN || '';
  }

  getCopyTitle(copy: any): string {
    return copy?.title || copy?.Title || '';
  }

  getCopyCustomBarcode(copy: any): string {
    return copy?.customBarcode || copy?.CustomBarcode || '';
  }

  getCopyShelf(copy: any): string {
    return copy?.shelfName || copy?.ShelfName || '';
  }

  getCopyRack(copy: any): string {
    return copy?.rackName || copy?.RackName || '';
  }
}