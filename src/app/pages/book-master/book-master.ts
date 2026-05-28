import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-book-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-master.html',
  styleUrl: './book-master.css'
})
export class BookMaster implements OnInit {

  books: any[] = [];
  authors: any[] = [];
  publishers: any[] = [];
  languages: any[] = [];
  categories: any[] = [];

  searchText = '';

  showImport = false;
  showAddBook = false;

  editMode = false;
  editBookId = 0;

  userRole = localStorage.getItem('role') || localStorage.getItem('userType') || '';
  userName = localStorage.getItem('userName') || 'Admin';

  selectedFileName = '';
  importedBooks: any[] = [];
  importErrors: any[] = [];

  totalRows = 0;
  processedRows = 0;
  insertedRows = 0;
  skippedRows = 0;
  progressPercent = 0;
  isImporting = false;
  batchSize = 500;

  bookForm: any = this.emptyBookForm();

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadMasters();
    this.loadBooks();
  }

  emptyBookForm() {
    return {
      title: '',
      isbn: '',
      authorId: null,
      publisherId: null,
      languageId: null,
      categoryId: null,
      bookPrefix: '',
      codeNo: '',
      customBarcode: '',
      createdBy: this.userName,
      editedBy: this.userName
    };
  }

  normalizeArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data?.$values) return data.$values;
    if (data?.data) return data.data;
    if (data?.result) return data.result;
    return [];
  }

  getAnyValue(item: any, keys: string[]): string {
    if (!item) return '';

    for (const key of keys) {
      const foundKey = Object.keys(item).find(
        k => k.toLowerCase() === key.toLowerCase()
      );

      if (foundKey && item[foundKey] !== null && item[foundKey] !== undefined) {
        return item[foundKey].toString();
      }
    }

    return '';
  }

  getId(item: any): any {
    return Number(this.getAnyValue(item, ['id', 'Id']));
  }

  getAuthorName(item: any): string {
    return this.getAnyValue(item, ['authorName', 'AuthorName', 'name', 'Name']);
  }

  getPublisherName(item: any): string {
    return this.getAnyValue(item, ['publisherName', 'PublisherName', 'name', 'Name']);
  }

  getLanguageName(item: any): string {
    return this.getAnyValue(item, ['languageName', 'LanguageName', 'name', 'Name']);
  }

  getCategoryName(item: any): string {
    return this.getAnyValue(item, ['categoryName', 'CategoryName', 'name', 'Name']);
  }

  getLanguagePrefix(item: any): string {
    return this.getAnyValue(item, ['languagePrefix', 'LanguagePrefix']);
  }

  getCategoryPrefix(item: any): string {
    return this.getAnyValue(item, [
      'categoryPrefix',
      'CategoryPrefix',
      'categoryCode',
      'CategoryCode'
    ]);
  }

  canExportExcel(): boolean {
  const role = this.userRole.toLowerCase().trim();

  return [
    'admin',
    'secretary',
    'treasurer',
    'internal auditor',
    'librarian',
    'assistant librarian'
  ].includes(role);
}

canBookImport(): boolean {
  const role = this.userRole.toLowerCase().trim();
  return role === 'admin';
}

canAddBook(): boolean {
  const role = this.userRole.toLowerCase().trim();

  return [
    'admin',
    'secretary',
    'librarian',
    'assistant librarian'
  ].includes(role);
}

canEdit(): boolean {
  const role = this.userRole.toLowerCase().trim();

  return [
    'admin',
    'secretary',
    'librarian',
    'assistant librarian'
  ].includes(role);
}

canDelete(): boolean {
  const role = this.userRole.toLowerCase().trim();

  return [
    'admin',
    'secretary'
  ].includes(role);
}

  loadBooks() {
  this.api.getBooks().subscribe({
    next: (data: any) => {

      this.books = this.normalizeArray(data);

      // SORT BY ID ASCENDING
      this.books.sort((a: any, b: any) => {
        const idA = Number(a.id || a.Id || 0);
        const idB = Number(b.id || b.Id || 0);

        return idA - idB;
      });

    },
    error: (err: any) => {
      console.error('BOOK LOAD ERROR:', err);
      alert('Error while loading books');
    }
  });
}

  loadMasters() {
    this.api.getAuthors().subscribe({
      next: (data: any) => {
        this.authors = this.normalizeArray(data).sort((a: any, b: any) =>
          this.getAuthorName(a).localeCompare(this.getAuthorName(b))
        );
      },
      error: (err: any) => console.error('AUTHOR LOAD ERROR:', err)
    });

    this.api.getPublishers().subscribe({
      next: (data: any) => {
        this.publishers = this.normalizeArray(data).sort((a: any, b: any) =>
          this.getPublisherName(a).localeCompare(this.getPublisherName(b))
        );
      },
      error: (err: any) => console.error('PUBLISHER LOAD ERROR:', err)
    });

    this.api.getLanguages().subscribe({
      next: (data: any) => {
        this.languages = this.normalizeArray(data).sort((a: any, b: any) =>
          this.getLanguageName(a).localeCompare(this.getLanguageName(b))
        );
      },
      error: (err: any) => console.error('LANGUAGE LOAD ERROR:', err)
    });

    this.api.getCategories().subscribe({
      next: (data: any) => {
        this.categories = this.normalizeArray(data).sort((a: any, b: any) =>
          this.getCategoryName(a).localeCompare(this.getCategoryName(b))
        );
      },
      error: (err: any) => console.error('CATEGORY LOAD ERROR:', err)
    });
  }

  get filteredBooks() {
    const search = this.searchText.toLowerCase();

    return this.books.filter((b: any) =>
      b.isbn?.toString().toLowerCase().includes(search) ||
      b.iSBN?.toString().toLowerCase().includes(search) ||
      b.customBarcode?.toString().toLowerCase().includes(search) ||
      b.bookPrefix?.toString().toLowerCase().includes(search) ||
      b.codeNo?.toString().toLowerCase().includes(search) ||
      b.title?.toString().toLowerCase().includes(search) ||
      b.authorName?.toString().toLowerCase().includes(search) ||
      b.publisherName?.toString().toLowerCase().includes(search) ||
      b.languageName?.toString().toLowerCase().includes(search) ||
      b.categoryName?.toString().toLowerCase().includes(search)
    );
  }

  openAddBook() {
    this.editMode = false;
    this.editBookId = 0;
    this.bookForm = this.emptyBookForm();
    this.showAddBook = true;
    this.loadMasters();
  }

  closeAddBook() {
    this.showAddBook = false;
    this.editMode = false;
    this.editBookId = 0;
  }

  findIdByName(list: any[], name: string, type: string): number | null {
    if (!name) return null;

    const cleanedName = name.trim().toLowerCase();

    const found = list.find((x: any) => {
      let itemName = '';

      if (type === 'author') itemName = this.getAuthorName(x);
      if (type === 'publisher') itemName = this.getPublisherName(x);
      if (type === 'language') itemName = this.getLanguageName(x);
      if (type === 'category') itemName = this.getCategoryName(x);

      return itemName.trim().toLowerCase() === cleanedName;
    });

    return found ? this.getId(found) : null;
  }

  editBook(book: any) {
    this.editMode = true;
    this.editBookId = Number(book.id || book.Id);

    const authorName = book.authorName || book.AuthorName || '';
    const publisherName = book.publisherName || book.PublisherName || '';
    const languageName = book.languageName || book.LanguageName || '';
    const categoryName = book.categoryName || book.CategoryName || '';

    const authorId =
      Number(book.authorId || book.AuthorId || book.authorID) ||
      this.findIdByName(this.authors, authorName, 'author');

    const publisherId =
      Number(book.publisherId || book.PublisherId || book.publisherID) ||
      this.findIdByName(this.publishers, publisherName, 'publisher');

    const languageId =
      Number(book.languageId || book.LanguageId || book.languageID) ||
      this.findIdByName(this.languages, languageName, 'language');

    const categoryId =
      Number(book.categoryId || book.CategoryId || book.categoryID) ||
      this.findIdByName(this.categories, categoryName, 'category');

    this.bookForm = {
      title: book.title || book.Title || '',
      isbn: book.isbn || book.iSBN || book.ISBN || '',

      authorId: authorId,
      publisherId: publisherId,
      languageId: languageId,
      categoryId: categoryId,

      bookPrefix: book.bookPrefix || book.BookPrefix || '',
      codeNo: book.codeNo || book.CodeNo || '',
      customBarcode: book.customBarcode || book.CustomBarcode || '',
      createdBy: this.userName,
      editedBy: this.userName
    };

    this.showAddBook = true;
  }

  generateBarcodePreview() {
    const category = this.categories.find(
      x => this.getId(x) == this.bookForm.categoryId
    );

    const language = this.languages.find(
      x => this.getId(x) == this.bookForm.languageId
    );

    if (!category || !language) {
      return;
    }

    const languagePrefix = this.getLanguagePrefix(language);
    const categoryPrefix = this.getCategoryPrefix(category);

    this.bookForm.bookPrefix = `${languagePrefix}${categoryPrefix}`;

    if (this.editMode) {
      this.bookForm.customBarcode = `${this.bookForm.bookPrefix}${this.bookForm.codeNo}`;
      return;
    }

    const samePrefixBooks = this.books.filter((x: any) =>
      x.bookPrefix === this.bookForm.bookPrefix
    );

    let lastNo = 0;

    samePrefixBooks.forEach((book: any) => {
      const number = parseInt(book.codeNo || '0', 10);

      if (!isNaN(number) && number > lastNo) {
        lastNo = number;
      }
    });

    const nextNo = (lastNo + 1).toString().padStart(4, '0');

    this.bookForm.codeNo = nextNo;
    this.bookForm.customBarcode = `${this.bookForm.bookPrefix}${nextNo}`;
  }

  saveBook() {
    if (!this.bookForm.title) {
      alert('Book title is required');
      return;
    }

    if (!this.bookForm.categoryId) {
      alert('Please select category');
      return;
    }

    if (!this.bookForm.languageId) {
      alert('Please select language');
      return;
    }

    this.generateBarcodePreview();

    const payload = {
      id: this.editBookId,
      title: this.bookForm.title,
      isbn: this.bookForm.isbn,
      categoryId: Number(this.bookForm.categoryId),
      authorId: this.bookForm.authorId ? Number(this.bookForm.authorId) : null,
      publisherId: this.bookForm.publisherId ? Number(this.bookForm.publisherId) : null,
      languageId: Number(this.bookForm.languageId),
      bookPrefix: this.bookForm.bookPrefix,
      codeNo: this.bookForm.codeNo,
      customBarcode: this.bookForm.customBarcode,
      createdBy: this.userName,
      editedBy: this.userName
    };

    if (this.editMode) {
      this.api.updateBook(this.editBookId, payload).subscribe({
        next: () => {
          alert('Book updated successfully');
          this.closeAddBook();
          this.loadBooks();
        },
        error: (err: any) => {
          console.error('UPDATE BOOK ERROR:', err);
          alert('Error while updating book');
        }
      });

      return;
    }

    this.api.saveBook(payload).subscribe({
      next: () => {
        alert('Book saved successfully');
        this.closeAddBook();
        this.loadBooks();
      },
      error: (err: any) => {
        console.error('SAVE BOOK ERROR:', err);
        alert(err?.error || 'Error while saving book');
      }
    });
  }

  deleteBook(book: any) {
    const id = book.id || book.Id;

    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    this.api.deleteBook(id, this.userName).subscribe({
      next: () => {
        alert('Book deleted successfully');
        this.loadBooks();
      },
      error: (err: any) => {
        console.error('DELETE BOOK ERROR:', err);
        alert('Error while deleting book');
      }
    });
  }

  openImport() {
    this.showImport = true;
  }

  closeImport() {
    this.showImport = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.selectedFileName = file.name;
    this.clearCounters();

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const excelRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: ''
      });

      this.importedBooks = excelRows.map((row: any) => ({
        bookName: this.getValue(row, ['BookName', 'Book Name', 'Title', 'TITLE']),
        isbn: this.getValue(row, ['ISBN', 'Isbn', 'isbn']),
        categoryId: Number(this.getValue(row, ['CategoryId', 'Category Id'])) || 0,
        authorId: Number(this.getValue(row, ['AuthorId', 'Author Id'])) || null,
        publisherId: Number(this.getValue(row, ['PublisherId', 'Publisher Id'])) || null,
        languageId: Number(this.getValue(row, ['LanguageId', 'Language Id'])) || 0,
        codePrefix: this.getValue(row, ['CodePrefix', 'Code Prefix']),
        codeNo: this.getValue(row, ['CodeNo', 'Code No']),
        createdBy: this.userName
      }));

      this.totalRows = this.importedBooks.length;
    };

    reader.readAsArrayBuffer(file);
  }

  getValue(row: any, possibleNames: string[]): any {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return row[name];
      }
    }

    return '';
  }

  async startImport() {
    if (this.importedBooks.length === 0) {
      alert('Please select Excel file first');
      return;
    }

    this.isImporting = true;
    this.importErrors = [];
    this.processedRows = 0;
    this.insertedRows = 0;
    this.skippedRows = 0;
    this.progressPercent = 0;

    for (let i = 0; i < this.importedBooks.length; i += this.batchSize) {
      const batch = this.importedBooks.slice(i, i + this.batchSize);

      try {
        const result: any = await this.api.bulkImportBooks(batch).toPromise();

        this.insertedRows += result.inserted || result.Inserted || 0;
        this.skippedRows += result.skipped || result.Skipped || 0;

        const errors = result.errors || result.Errors || [];

        if (errors.length > 0) {
          this.importErrors.push(...errors);
        }
      } catch (error: any) {
        this.skippedRows += batch.length;

        this.importErrors.push({
          rowNo: i + 1,
          bookName: '',
          error: error?.message || 'Import failed'
        });
      }

      this.processedRows += batch.length;
      this.progressPercent = Math.round((this.processedRows / this.totalRows) * 100);
    }

    this.isImporting = false;
    alert('Import completed');
    this.loadBooks();
  }

  clearCounters() {
    this.importedBooks = [];
    this.importErrors = [];
    this.totalRows = 0;
    this.processedRows = 0;
    this.insertedRows = 0;
    this.skippedRows = 0;
    this.progressPercent = 0;
  }

  clearImport() {
    this.selectedFileName = '';
    this.clearCounters();
    this.isImporting = false;
  }

  exportBooksToExcel() {
    const exportData = this.filteredBooks.map((b: any) => ({
    ISBN: b.isbn ?? b.iSBN ?? '',
    CustomBarcode: b.customBarcode ?? '',
    Title: b.title ?? '',
    Author: b.authorName ?? '',
    Publisher: b.publisherName ?? '',
    Language: b.languageName ?? '',
    Category: b.categoryName ?? '',
    CreatedOnDate: b.createdDate ? new Date(b.createdDate).toLocaleDateString('en-GB') : ''
    }));

    if (exportData.length === 0) {
      alert('No data found to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');
    XLSX.writeFile(workbook, 'Books.xlsx');
  }
}