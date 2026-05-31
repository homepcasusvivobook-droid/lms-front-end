import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { Api } from '../../services/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-issue.html',
  styleUrls: ['./book-issue.css']
})
export class BookIssue implements OnInit {

  @ViewChild('topScroll') topScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('tableScroll') tableScroll!: ElementRef<HTMLDivElement>;

  private baseUrl = environment.apiUrl;

  transactions: any[] = [];
  filteredTransactions: any[] = [];
  pagedTransactions: any[] = [];

  currentPage = 1;
  pageSize = 20;
  scrollContentWidth = 2400;

  memberSuggestions: any[] = [];
  bookSuggestions: any[] = [];
  availableCopiesForBook: any[] = [];

  selectedMember: any = null;
  selectedBook: any = null;
  selectedCopyId: any = null;
  selectedTransaction: any = null;

  issueMode: 'new' | 'edit' | 'reissue' = 'new';
  originalTransactionStatus = '';

  selectedMemberMaxBooks = 0;
  selectedMemberPendingBooks = 0;
  selectedMemberRemainingBooks = 0;

  issueRows: any[] = [];

  searchText = '';
  memberSearch = '';
  bookSearch = '';
  commonRemarks = '';

  fromDate = '2026-01-01';
  toDate = new Date().toISOString().substring(0, 10);
  dateType = 'IssueDate';
  statusFilter = 'All';

  showIssueModal = false;
  showReturnModal = false;

  userType = '';
  userName = '';

  canExportExcel = false;
  canBookIssue = false;
  canReturn = false;
  canReIssue = false;
  canEdit = false;
  canDelete = false;

  returnModel: any = {
    returnDate: new Date().toISOString().substring(0, 10),
    fineAmount: 0,
    remarks: '',
    createdBy: ''
  };

  constructor(
    private api: Api,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userType = localStorage.getItem('userType') || '';
    this.userName = localStorage.getItem('userName') || this.userType || 'Admin';

    this.canExportExcel = [
      'Admin',
      'Secretary',
      'Treasurer',
      'Internal Auditor',
      'Librarian',
      'Assistant Librarian'
    ].includes(this.userType);

    this.canBookIssue = ['Admin', 'Librarian', 'Assistant Librarian'].includes(this.userType);
    this.canReturn = this.canBookIssue;
    this.canReIssue = this.canBookIssue;

    this.canEdit = ['Admin', 'Secretary'].includes(this.userType);
    this.canDelete = ['Admin', 'Secretary'].includes(this.userType);

    this.loadTransactions();
  }

  todayString(): string {
    return new Date().toISOString().substring(0, 10);
  }

  dueDateString(issueDate?: string): string {
    const d = issueDate ? new Date(issueDate) : new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().substring(0, 10);
  }

  loadTransactions(): void {
    this.http.get(
      `${this.baseUrl}/LibraryTransactions?fromDate=${this.fromDate}&toDate=${this.toDate}&dateType=${this.dateType}&status=${this.statusFilter}`
    ).subscribe({
      next: (res: any) => {
        this.transactions = Array.isArray(res) ? res : (res?.$values || []);
        this.applyFilters();
      },
      error: (err: any) => {
        console.error('Load transaction error:', err);
        alert(this.getErrorMessage(err, 'Failed to load transactions'));
      }
    });
  }

  applyFilters(): void {
    let data = [...this.transactions];

    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase();

      data = data.filter(x =>
        String(x.id || '').toLowerCase().includes(term) ||
        String(x.memberId || '').toLowerCase().includes(term) ||
        String(x.cardexNo || '').toLowerCase().includes(term) ||
        String(x.phoneNo || '').toLowerCase().includes(term) ||
        String(x.memberName || '').toLowerCase().includes(term) ||
        String(x.bookName || '').toLowerCase().includes(term) ||
        String(x.barcode || '').toLowerCase().includes(term) ||
        String(x.isbn || x.ISBN || '').toLowerCase().includes(term)
      );
    }

    if (this.statusFilter === 'Pending') {
      data = data.filter(x => (x.status || '').toLowerCase() === 'issued');
    }

    if (this.statusFilter === 'Returned') {
      data = data.filter(x => (x.status || '').toLowerCase() === 'returned');
    }

    if (this.statusFilter === 'Overdue') {
      const today = new Date();
      data = data.filter(x =>
        (x.status || '').toLowerCase() === 'issued' &&
        x.dueDate &&
        new Date(x.dueDate) < today
      );
    }

    if (this.fromDate) {
      data = data.filter(x => {
        const dateValue = this.getDateByType(x);
        return dateValue && new Date(dateValue) >= new Date(this.fromDate);
      });
    }

    if (this.toDate) {
      data = data.filter(x => {
        const dateValue = this.getDateByType(x);
        return dateValue && new Date(dateValue) <= new Date(this.toDate);
      });
    }

    data.sort((a: any, b: any) =>
      Number(b.id || b.Id || 0) - Number(a.id || a.Id || 0)
    );

    this.filteredTransactions = data;
    this.currentPage = 1;
    this.updatePagedTransactions();
  }

  updatePagedTransactions(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTransactions = this.filteredTransactions.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.pageSize) || 1;
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedTransactions();
  }

  syncScroll(source: 'top' | 'table'): void {
    if (!this.topScroll || !this.tableScroll) return;

    if (source === 'top') {
      this.tableScroll.nativeElement.scrollLeft = this.topScroll.nativeElement.scrollLeft;
    } else {
      this.topScroll.nativeElement.scrollLeft = this.tableScroll.nativeElement.scrollLeft;
    }
  }

  getDateByType(x: any): any {
    if (this.dateType === 'DueDate') return x.dueDate;
    if (this.dateType === 'ReturnDate') return x.returnDate;
    return x.issueDate;
  }

  getErrorMessage(err: any, defaultMessage: string): string {
    if (typeof err?.error === 'string') return err.error;
    if (err?.error?.message) return err.error.message;
    if (err?.error?.title) return err.error.title;
    if (err?.message) return err.message;
    return defaultMessage;
  }

  getIssueModalTitle(): string {
    if (this.issueMode === 'edit') return 'Edit Book Issue';
    if (this.issueMode === 'reissue') return 'Re-Issue Book';
    return 'New Book Issue';
  }

  getSaveButtonText(): string {
    if (this.issueMode === 'edit') return 'Update Issue';
    if (this.issueMode === 'reissue') return 'Save Re-Issue';
    return 'Book Issue';
  }

  isReturnedTransaction(item: any): boolean {
    return (item.status || '').toLowerCase() === 'returned';
  }

  getDisplayStatus(item: any): string {
    const dbStatus = (item.status || '').toLowerCase();
    const remarks = (item.remarks || '').toLowerCase();

    if (dbStatus === 'returned') {
      return 'Returned';
    }

    const isReIssued = remarks.includes('re-issued') || remarks.includes('reissued');
    const isEdited = remarks.includes('edited');

    if (isReIssued && isEdited) return 'Re-Issued - Edited';
    if (isReIssued) return 'Re-Issued';
    if (isEdited) return 'Issued - Edited';

    return 'Issued';
  }

  getStatusClass(item: any): string {
    return this.getDisplayStatus(item).toLowerCase().replace(/\s+/g, '-');
  }

  canEditTransaction(item: any): boolean {
    return !this.isReturnedTransaction(item);
  }

  canReIssueTransaction(item: any): boolean {
    return !this.isReturnedTransaction(item);
  }

  isNewMode(): boolean {
    return this.issueMode === 'new';
  }

  isEditMode(): boolean {
    return this.issueMode === 'edit';
  }

  isReIssueMode(): boolean {
    return this.issueMode === 'reissue';
  }

  canShowAddCopyButton(): boolean {
    return this.issueMode === 'new';
  }

  canShowDeleteIssueRow(): boolean {
    return this.issueMode === 'new';
  }

  canEditMemberField(): boolean {
    return this.issueMode === 'new' || this.issueMode === 'edit';
  }

  canEditBookField(): boolean {
    return this.issueMode === 'new' || this.issueMode === 'edit';
  }

  canEditCopySelection(): boolean {
    return this.issueMode === 'new' || this.issueMode === 'edit';
  }

  getIssueModeCredit(): number {
    const status = (this.originalTransactionStatus || '').toLowerCase();

    if ((this.issueMode === 'edit' || this.issueMode === 'reissue') && status === 'issued') {
      return 1;
    }

    return 0;
  }

  getPendingBooksDisplay(): number {
    const pending = Number(this.selectedMemberPendingBooks || 0);
    return Math.max(0, pending - this.getIssueModeCredit());
  }

  getAllowedRowsInModal(): number {
    const max = Number(this.selectedMemberMaxBooks || 0);
    const pendingAfterCredit = this.getPendingBooksDisplay();
    return Math.max(0, max - pendingAfterCredit);
  }

  getRemainingBooksDisplay(): number {
    return Math.max(0, this.getAllowedRowsInModal() - this.issueRows.length);
  }

  canAddMoreBookRows(): boolean {
    return this.getRemainingBooksDisplay() > 0;
  }

  canSaveIssue(): boolean {
    if (!this.selectedMember) return false;
    if (this.issueRows.length === 0) return false;
    return this.getAllowedRowsInModal() >= this.issueRows.length;
  }

  openIssueModal(): void {
    this.showIssueModal = true;
    this.issueMode = 'new';
    this.originalTransactionStatus = '';
    this.selectedTransaction = null;
    this.selectedMember = null;

    this.selectedMemberMaxBooks = 0;
    this.selectedMemberPendingBooks = 0;
    this.selectedMemberRemainingBooks = 0;

    this.selectedBook = null;
    this.selectedCopyId = null;

    this.memberSearch = '';
    this.bookSearch = '';
    this.commonRemarks = '';

    this.memberSuggestions = [];
    this.bookSuggestions = [];
    this.availableCopiesForBook = [];
    this.issueRows = [];
  }

  closeIssueModal(): void {
    this.showIssueModal = false;
  }

  searchMembers(): void {
    if (!this.canEditMemberField()) return;

    if (!this.memberSearch.trim()) {
      this.memberSuggestions = [];
      return;
    }

    this.http
      .get(`${this.baseUrl}/LibraryTransactions/search-members?term=${encodeURIComponent(this.memberSearch)}`)
      .subscribe({
        next: (res: any) => {
          this.memberSuggestions = Array.isArray(res) ? res : (res?.$values || []);
        },
        error: (err: any) => console.error(err)
      });
  }

  selectMember(member: any): void {
    if (!this.canEditMemberField()) return;

    this.selectedMember = member;
    this.selectedMemberMaxBooks = Number(member.maxBooksAllowed || 0);
    this.selectedMemberPendingBooks = Number(member.pendingBooksCount || 0);
    this.selectedMemberRemainingBooks = Number(member.remainingBooksAllowed || 0);

    this.memberSearch = `${member.memberName} - ${member.cardexNo}`;
    this.memberSuggestions = [];
  }

  loadSelectedMemberLimitInfo(term: string): void {
    if (!term) return;

    this.http
      .get(`${this.baseUrl}/LibraryTransactions/search-members?term=${encodeURIComponent(term)}`)
      .subscribe({
        next: (res: any) => {
          const list: any[] = Array.isArray(res) ? res : (res?.$values || []);
          const member = list[0];

          if (!member) return;

          this.selectedMember = {
            ...this.selectedMember,
            ...member
          };

          this.selectedMemberMaxBooks = Number(member.maxBooksAllowed || 0);
          this.selectedMemberPendingBooks = Number(member.pendingBooksCount || 0);
          this.selectedMemberRemainingBooks = Number(member.remainingBooksAllowed || 0);
        },
        error: (err: any) => console.error(err)
      });
  }

  searchBooks(): void {
    if (!this.canEditBookField()) return;

    if (!this.bookSearch.trim()) {
      this.bookSuggestions = [];
      this.availableCopiesForBook = [];
      this.selectedBook = null;
      this.selectedCopyId = null;
      return;
    }

    const term = this.bookSearch.trim();

    this.http
      .get(`${this.baseUrl}/LibraryTransactions/search-books?term=${encodeURIComponent(term)}`)
      .subscribe({
        next: (res: any) => {
          const list: any[] = Array.isArray(res) ? res : (res?.$values || []);

          if (list.length === 0 && term.includes('-C')) {
            alert('No available book copy found for barcode: ' + term);
            this.selectedBook = null;
            this.selectedCopyId = null;
            this.bookSuggestions = [];
            this.availableCopiesForBook = [];
            return;
          }

          this.availableCopiesForBook = list;

          const exactCopy = list.find(x =>
            String(x.barcode || x.copyBarcode || '').trim().toLowerCase() === term.toLowerCase()
          );

          if (exactCopy) {
            this.selectedBook = {
              bookId: exactCopy.bookId,
              bookName: exactCopy.bookName || exactCopy.bookTitle || '',
              isbn: exactCopy.isbn || exactCopy.ISBN || ''
            };

            this.bookSearch = `${this.selectedBook.bookName} - ${this.selectedBook.isbn}`;

            this.availableCopiesForBook = list.filter(x =>
              x.bookId === exactCopy.bookId
            );

            this.selectedCopyId = exactCopy.id;
            this.bookSuggestions = [];
            return;
          }

          const uniqueBooks: any[] = [];

          list.forEach((x: any) => {
            if (!uniqueBooks.some(b => b.bookId === x.bookId)) {
              uniqueBooks.push({
                bookId: x.bookId,
                bookName: x.bookName || x.bookTitle || '',
                isbn: x.isbn || x.ISBN || ''
              });
            }
          });

          this.bookSuggestions = uniqueBooks;
        },
        error: (err: any) => {
          console.error(err);
          alert(this.getErrorMessage(err, 'Book search failed'));
          this.selectedBook = null;
          this.selectedCopyId = null;
          this.bookSuggestions = [];
          this.availableCopiesForBook = [];
        }
      });
  }

  selectBook(book: any): void {
    if (!this.canEditBookField()) return;

    this.selectedBook = book;
    this.bookSearch = `${book.bookName} - ${book.isbn}`;
    this.bookSuggestions = [];
    this.selectedCopyId = null;

    this.http
      .get(`${this.baseUrl}/LibraryTransactions/search-books?term=${encodeURIComponent(book.isbn)}`)
      .subscribe({
        next: (res: any) => {
          this.availableCopiesForBook = Array.isArray(res) ? res : (res?.$values || []);
        },
        error: (err: any) => console.error(err)
      });
  }

  addSelectedCopyToGrid(): void {
    if (!this.canShowAddCopyButton()) {
      alert('Add copy is allowed only for new book issue.');
      return;
    }

    if (!this.selectedMember) {
      alert('Please select member first');
      return;
    }

    if (!this.selectedBook) {
      alert('Please select book');
      return;
    }

    if (!this.selectedCopyId) {
      alert('Please select book copy barcode');
      return;
    }

    const copy = this.availableCopiesForBook.find(x => x.id == this.selectedCopyId);

    if (!copy) {
      alert('Invalid copy selected');
      return;
    }

    if (this.issueRows.some(x => x.bookCopyId === copy.id)) {
      alert('This copy already added');
      return;
    }

    if (!this.canAddMoreBookRows()) {
      alert('Member book issue limit reached. No remaining books allowed.');
      return;
    }

    const issueDate = this.todayString();

    this.issueRows.push({
      bookCopyId: copy.id,
      bookName: copy.bookName || copy.bookTitle || '',
      isbn: copy.isbn || copy.ISBN || '',
      barcode: copy.barcode || copy.copyBarcode || '',
      shelfName: copy.shelfName || '',
      rackName: copy.rackName || '',
      issueDate: issueDate,
      dueDate: this.dueDateString(issueDate)
    });

    this.selectedCopyId = null;
    this.selectedBook = null;
    this.bookSearch = '';
    this.bookSuggestions = [];
    this.availableCopiesForBook = [];
  }

  removeIssueRow(index: number): void {
    if (!this.canShowDeleteIssueRow()) {
      alert('Delete row is allowed only for new book issue.');
      return;
    }

    this.issueRows.splice(index, 1);
  }

  onIssueDateChange(row: any): void {
    row.dueDate = this.dueDateString(row.issueDate);
  }

  saveIssue(): void {
    if (!this.selectedMember) {
      alert('Please select member');
      return;
    }

    if (this.issueRows.length === 0) {
      alert('Please add at least one book copy');
      return;
    }

    if (!this.canSaveIssue()) {
      alert('Member book issue limit exceeded.');
      return;
    }

    if (this.issueMode === 'edit' && this.selectedTransaction) {
      const row = this.issueRows[0];

      const payload = {
        id: this.selectedTransaction.id,
        memberId: this.selectedMember.id,
        bookCopyId: row.bookCopyId,
        issueDate: row.issueDate,
        dueDate: row.dueDate,
        remarks: this.commonRemarks,
        editedBy: this.userName
      };

      this.http
        .put(`${this.baseUrl}/LibraryTransactions/${this.selectedTransaction.id}`, payload)
        .subscribe({
          next: () => {
            alert('Transaction updated successfully');
            this.selectedTransaction = null;
            this.issueMode = 'new';
            this.closeIssueModal();
            this.loadTransactions();
          },
          error: (err: any) => {
            console.error(err);
            alert(this.getErrorMessage(err, 'Update failed'));
          }
        });

      return;
    }

    let completed = 0;
    let failed = false;

    this.issueRows.forEach(row => {
      const payload = {
        memberId: this.selectedMember.id,
        bookCopyId: row.bookCopyId,
        issueDate: row.issueDate,
        dueDate: row.dueDate,
        remarks: this.commonRemarks,
        createdBy: this.userName
      };

      this.api.issueBook(payload).subscribe({
        next: () => {
          completed++;

          if (completed === this.issueRows.length && !failed) {
            alert(this.issueMode === 'reissue' ? 'Book re-issued successfully' : 'Books issued successfully');
            this.closeIssueModal();
            this.issueMode = 'new';
            this.loadTransactions();
          }
        },
        error: (err: any) => {
          failed = true;
          console.error(err);
          alert(this.getErrorMessage(err, 'Issue failed'));
        }
      });
    });
  }

  openReturnModal(transaction: any): void {
    this.selectedTransaction = transaction;
    this.showReturnModal = true;

    this.returnModel = {
      returnDate: this.todayString(),
      fineAmount: transaction.fineAmount || 0,
      remarks: '',
      createdBy: this.userName
    };
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
  }

  saveReturn(): void {
    if (!this.selectedTransaction) {
      alert('No transaction selected.');
      return;
    }

    const data = {
      bookIssueId: this.selectedTransaction.bookIssueId,
      returnDate: this.returnModel.returnDate,
      fineAmount: this.returnModel.fineAmount,
      remarks: this.returnModel.remarks,
      createdBy: this.userName
    };

    this.http
      .post(`${this.baseUrl}/LibraryTransactions/return/${this.selectedTransaction.bookIssueId}`, data)
      .subscribe({
        next: () => {
          alert('Book returned successfully');
          this.closeReturnModal();
          this.loadTransactions();
        },
        error: (err: any) => {
          console.error(err);
          alert(this.getErrorMessage(err, 'Failed to return book'));
        }
      });
  }

  editIssue(item: any): void {
    if (this.isReturnedTransaction(item)) {
      alert('Cannot edit a returned transaction.');
      return;
    }

    this.showIssueModal = true;
    this.issueMode = 'edit';
    this.originalTransactionStatus = item.status || '';
    this.selectedTransaction = item;

    this.selectedMember = {
      id: item.memberId,
      memberName: item.memberName,
      cardexNo: item.cardexNo,
      phoneNo: item.phoneNo,
      memberTypeName: item.memberTypeName,
      memberStatus: item.memberStatus,
      membershipExpiredOn: item.membershipExpiredOn
    };

    this.selectedMemberMaxBooks = Number(item.maxBooksAllowed || 0);
    this.selectedMemberPendingBooks = Number(item.pendingBooksCount || 0);
    this.selectedMemberRemainingBooks = Number(item.remainingBooksAllowed || 0);

    this.loadSelectedMemberLimitInfo(item.cardexNo);

    this.selectedBook = {
      bookId: item.bookId,
      bookName: item.bookName,
      isbn: item.isbn || item.ISBN || ''
    };

    this.memberSearch = `${item.memberName} - ${item.cardexNo}`;
    this.bookSearch = `${item.bookName} - ${item.isbn || item.ISBN || ''}`;

    this.issueRows = [{
      bookCopyId: item.bookCopyId,
      bookName: item.bookName,
      isbn: item.isbn || item.ISBN || '',
      barcode: item.barcode,
      shelfName: item.shelfName,
      rackName: item.rackName,
      issueDate: item.issueDate?.substring(0, 10),
      dueDate: item.dueDate?.substring(0, 10)
    }];

    this.commonRemarks = item.remarks ? item.remarks + ' | Edited' : 'Edited';

    this.memberSuggestions = [];
    this.bookSuggestions = [];
    this.availableCopiesForBook = [];
  }

  reIssue(item: any): void {
    if (this.isReturnedTransaction(item)) {
      alert('Cannot re-issue a returned transaction.');
      return;
    }

    if (!confirm('This book is currently issued. Do you want to auto-return and re-issue it?')) {
      return;
    }

    const returnData = {
      bookIssueId: item.bookIssueId,
      returnDate: this.todayString(),
      fineAmount: 0,
      remarks: 'Auto returned for re-issue',
      createdBy: this.userName
    };

    this.http
      .post(`${this.baseUrl}/LibraryTransactions/return/${item.bookIssueId}`, returnData)
      .subscribe({
        next: () => {
          this.openReIssueModal({
            ...item,
            status: 'Issued'
          });
          this.loadTransactions();
        },
        error: (err: any) => {
          console.error(err);
          alert(this.getErrorMessage(err, 'Auto return failed'));
        }
      });
  }

  openReIssueModal(item: any): void {
    this.showIssueModal = true;
    this.issueMode = 'reissue';
    this.originalTransactionStatus = 'Issued';
    this.selectedTransaction = null;

    this.selectedMember = {
      id: item.memberId,
      memberName: item.memberName,
      cardexNo: item.cardexNo,
      phoneNo: item.phoneNo,
      memberTypeName: item.memberTypeName,
      memberStatus: item.memberStatus,
      membershipExpiredOn: item.membershipExpiredOn
    };

    this.selectedMemberMaxBooks = Number(item.maxBooksAllowed || 0);
    this.selectedMemberPendingBooks = Number(item.pendingBooksCount || 0);
    this.selectedMemberRemainingBooks = Number(item.remainingBooksAllowed || 0);

    this.loadSelectedMemberLimitInfo(item.cardexNo);

    this.selectedBook = {
      bookId: item.bookId,
      bookName: item.bookName,
      isbn: item.isbn || item.ISBN || ''
    };

    this.memberSearch = `${item.memberName} - ${item.cardexNo}`;
    this.bookSearch = `${item.bookName} - ${item.isbn || item.ISBN || ''}`;

    this.memberSuggestions = [];
    this.bookSuggestions = [];
    this.availableCopiesForBook = [];
    this.selectedCopyId = null;

    const issueDate = this.todayString();

    this.issueRows = [{
      bookCopyId: item.bookCopyId,
      bookName: item.bookName,
      isbn: item.isbn || item.ISBN || '',
      barcode: item.barcode,
      shelfName: item.shelfName,
      rackName: item.rackName,
      issueDate: issueDate,
      dueDate: this.dueDateString(issueDate)
    }];

    this.commonRemarks = item.remarks ? item.remarks + ' | Re-issued' : 'Re-issued';
  }

  deleteTransaction(id: number): void {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    this.http
      .delete(`${this.baseUrl}/LibraryTransactions/${id}?deletedBy=${encodeURIComponent(this.userName)}`)
      .subscribe({
        next: () => {
          alert('Transaction deleted');
          this.loadTransactions();
        },
        error: (err: any) => {
          console.error(err);
          alert(this.getErrorMessage(err, 'Delete failed'));
        }
      });
  }

  exportExcel(): void {
    const exportData = this.filteredTransactions.map(x => ({
      TransactionId: x.id,
      MemberId: x.memberId,
      CardexNo: x.cardexNo,
      PhoneNo: x.phoneNo,
      MemberName: x.memberName,
      ISBN: x.isbn,
      Barcode: x.barcode,
      BookTitle: x.bookName,
      IssueDate: this.formatDate(x.issueDate),
      DueDate: this.formatDate(x.dueDate),
      ReturnDate: this.formatDate(x.returnDate),
      Status: this.getDisplayStatus(x),
      Remarks: x.remarks
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'Book-Issue-Return.xlsx');
  }

  formatDate(value: any): string {
    if (!value) return '-';

    const d = new Date(value);

    if (isNaN(d.getTime())) {
      return '-';
    }

    return d.toLocaleDateString('en-GB');
  }
}