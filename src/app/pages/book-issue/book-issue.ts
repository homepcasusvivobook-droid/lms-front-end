import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { Api } from '../../services/api';

@Component({
  selector: 'app-book-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-issue.html',
  styleUrls: ['./book-issue.css']
})
export class BookIssue implements OnInit {

  private baseUrl = 'https://localhost:7126/api';

  transactions: any[] = [];
  filteredTransactions: any[] = [];

  memberSuggestions: any[] = [];
  bookSuggestions: any[] = [];
  availableCopiesForBook: any[] = [];

  selectedMember: any = null;
  selectedBook: any = null;
  selectedCopyId: any = null;
  selectedTransaction: any = null;

  selectedMemberMaxBooks: number = 0;
  selectedMemberPendingBooks: number = 0;
  selectedMemberRemainingBooks: number = 0;

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

  userType: string = '';
  userName: string = '';

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

  this.canBookIssue = [
    'Admin',
    'Librarian',
    'Assistant Librarian'
  ].includes(this.userType);

  this.canReturn = this.canBookIssue;
  this.canReIssue = this.canBookIssue;

  this.canEdit = [
    'Admin',
    'Secretary'
  ].includes(this.userType);

  this.canDelete = [
    'Admin',
    'Secretary'
  ].includes(this.userType);

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
  `${this.baseUrl}/LibraryTransactions?fromDate=${this.fromDate}&toDate=${this.toDate}&dateType=${this.dateType}&status=${this.statusFilter}`).subscribe({
      next: (res: any) => {

          console.log(res);

        this.transactions = res || [];
        this.applyFilters();
      },
      error: (err: any) => {
        console.error(err);
        console.error('Load transaction error:', err);

let msg = 'Failed to load transactions';

if (typeof err.error === 'string') {
  msg = err.error;
} else if (err.error?.message) {
  msg = err.error.message;
} else if (err.error?.title) {
  msg = err.error.title;
} else if (err.message) {
  msg = err.message;
}

alert(msg);
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
      data = data.filter(x => x.status === 'Issued');
    }

    if (this.statusFilter === 'Returned') {
      data = data.filter(x => x.status === 'Returned');
    }

    if (this.statusFilter === 'Overdue') {
      const today = new Date();
      data = data.filter(x =>
        x.status === 'Issued' &&
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

    this.filteredTransactions = data;
  }

  getDateByType(x: any): any {
    if (this.dateType === 'DueDate') return x.dueDate;
    if (this.dateType === 'ReturnDate') return x.returnDate;
    return x.issueDate;
  }

  openIssueModal(): void {
    this.showIssueModal = true;

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
    if (!this.memberSearch.trim()) {
      this.memberSuggestions = [];
      return;
    }

    this.http
      .get(`${this.baseUrl}/LibraryTransactions/search-members?term=${encodeURIComponent(this.memberSearch)}`)
      .subscribe({
        next: (res: any) => {
          this.memberSuggestions = res || [];
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }

  selectMember(member: any): void {
  this.selectedMember = member;

  this.selectedMemberMaxBooks = Number(member.maxBooksAllowed || 0);
  this.selectedMemberPendingBooks = Number(member.pendingBooksCount || 0);
  this.selectedMemberRemainingBooks = Number(member.remainingBooksAllowed || 0);

  this.memberSearch = `${member.memberName} - ${member.cardexNo}`;
  this.memberSuggestions = [];
}

  searchBooks(): void {
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
        const list: any[] = res || [];

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

  let msg = 'Book search failed';

  if (typeof err.error === 'string') {
    msg = err.error;
  } else if (err.error?.message) {
    msg = err.error.message;
  } else if (err.error?.title) {
    msg = err.error.title;
  }

  alert(msg);

  this.selectedBook = null;
  this.selectedCopyId = null;
  this.bookSuggestions = [];
  this.availableCopiesForBook = [];
}
    });
}

  selectBook(book: any): void {
    this.selectedBook = book;
    this.bookSearch = `${book.bookName} - ${book.isbn}`;
    this.bookSuggestions = [];
    this.selectedCopyId = null;

    this.http
      .get(`${this.baseUrl}/LibraryTransactions/search-books?term=${encodeURIComponent(book.isbn)}`)
      .subscribe({
        next: (res: any) => {
          this.availableCopiesForBook = res || [];
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }

  addSelectedCopyToGrid(): void {
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

      const remaining = this.selectedMemberRemainingBooks - this.issueRows.length;

    if (remaining <= 0) {
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

    if (this.selectedTransaction) {
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
        this.closeIssueModal();
        this.loadTransactions();
      },
      error: (err: any) => {
        console.error(err);
        alert(err.error || 'Update failed');
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
            alert('Books issued successfully');
            this.closeIssueModal();
            this.loadTransactions();
          }
        },
        error: (err: any) => {
          failed = true;
          console.error(err);
          let msg = 'Issue failed';

        if (typeof err.error === 'string') {
         msg = err.error;
        } else if (err.error?.message) {
         msg = err.error.message;
        } else if (err.error?.title) {
         msg = err.error.title;
        }

alert(msg);
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
          alert(err.error || 'Failed to return book');
        }
      });
  }

  editIssue(item: any): void {
  this.showIssueModal = true;

  this.selectedTransaction = item;

  this.selectedMember = {
    id: item.memberId,
    memberName: item.memberName,
    cardexNo: item.cardexNo,
    phoneNo: item.phoneNo,
    memberStatus: item.memberStatus,
    membershipExpiredOn: item.membershipExpiredOn
  };

  this.selectedMemberMaxBooks = Number(item.maxBooksAllowed || 0);
  this.selectedMemberPendingBooks = Number(item.pendingBooksCount || 0);
  this.selectedMemberRemainingBooks = Number(item.remainingBooksAllowed || 0);

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
  const status = (item.status || '').toLowerCase();

  if (status === 'returned') {
    this.openReIssueModal(item);
    return;
  }

  if (status === 'issued') {
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
          this.openReIssueModal(item);
          this.loadTransactions();
        },
        error: (err: any) => {
          console.error(err);
          alert(err.error || 'Auto return failed');
        }
      });

    return;
  }

  alert('Invalid transaction status.');
}

openReIssueModal(item: any): void {
  this.showIssueModal = true;

  this.selectedMember = {
    id: item.memberId,
    memberName: item.memberName,
    cardexNo: item.cardexNo,
    phoneNo: item.phoneNo,
    memberStatus: item.memberStatus,
    membershipExpiredOn: item.membershipExpiredOn
  };

  this.selectedMemberMaxBooks = Number(item.maxBooksAllowed || 0);
  this.selectedMemberPendingBooks = Number(item.pendingBooksCount || 0);
  this.selectedMemberRemainingBooks = Number(item.remainingBooksAllowed || 0);

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

  this.issueRows = [
    {
      bookCopyId: item.bookCopyId,
      bookName: item.bookName,
      isbn: item.isbn || item.ISBN || '',
      barcode: item.barcode,
      shelfName: item.shelfName,
      rackName: item.rackName,
      issueDate: issueDate,
      dueDate: this.dueDateString(issueDate)
    }
  ];

  this.commonRemarks = item.remarks  ? item.remarks + ' | Re-issued'  : 'Re-issued';
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
        alert(err.error || 'Delete failed');
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
      BookTitle: x.bookName,
      Barcode: x.barcode,
      IssueDate: this.formatDate(x.issueDate),
      DueDate: this.formatDate(x.dueDate),
      ReturnDate: this.formatDate(x.returnDate),
      Status: x.status,
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