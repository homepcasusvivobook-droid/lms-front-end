import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-book-purchase',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './book-purchase.html',
  styleUrl: './book-purchase.css'
})
export class BookPurchase implements OnInit {

  purchases: any[] = [];
  filteredPurchases: any[] = [];

  userType = localStorage.getItem('userType') || '';
  userName = localStorage.getItem('userName') || 'Admin';

  books: any[] = [];
  shelves: any[] = [];
  racks: any[] = [];

  searchText = '';
  fromDate = '2026-01-01';
  toDate = '2026-12-31';

  showAddModal = false;
  showEditModal = false;
  showViewModal = false;

  selectedPurchase: any = null;

  purchaseForm: any = {
  id: 0,
  purchaseType: 'Purchase',
  invoiceNo: '',
  storeName: '',
  sponsorName: '',
  purchaseDate: '',
  currency: 'AED',
  conversionRate: 1,
  totalCost: 0,
  totalCostAed: 0,
  remarks: '',
  details: []
};

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadPurchases();
    this.loadBooks();
    this.loadShelves();
    this.loadRacks();
  }

  loadPurchases(): void {
    this.api.getBookPurchases().subscribe({
      next: (res: any) => {
        this.purchases = Array.isArray(res)
          ? res
          : (res?.$values || []);

        this.purchases.sort((a: any, b: any) => {
          const idA = Number(a.id || a.Id || 0);
          const idB = Number(b.id || b.Id || 0);
          return idA - idB;
        });

        this.onSearch();
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load purchases');
      }
    });
  }

  loadBooks(): void {
    this.api.getBooks().subscribe({
      next: (res: any) => {
        this.books = Array.isArray(res)
          ? res
          : (res?.$values || []);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  loadShelves(): void {
    this.api.getShelves().subscribe({
      next: (res: any) => {
        this.shelves = Array.isArray(res)
          ? res
          : (res?.$values || []);

        this.shelves.sort((a: any, b: any) => {
          const idA = Number(a.id || a.Id || 0);
          const idB = Number(b.id || b.Id || 0);
          return idA - idB;
        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  loadRacks(): void {
    this.api.getRacks().subscribe({
      next: (res: any) => {
        this.racks = Array.isArray(res)
          ? res
          : (res?.$values || []);

        this.racks.sort((a: any, b: any) => {
          const idA = Number(a.id || a.Id || 0);
          const idB = Number(b.id || b.Id || 0);
          return idA - idB;
        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  onSearch(): void {
  const txt = this.searchText.toLowerCase().trim();

  const from = this.fromDate
    ? new Date(this.fromDate + 'T00:00:00')
    : null;

  const to = this.toDate
    ? new Date(this.toDate + 'T23:59:59')
    : null;

  this.filteredPurchases = this.purchases.filter((x: any) => {
    const rawDate = x.purchaseDate || x.PurchaseDate;

    if (!rawDate) return false;

    const purchaseDate = new Date(rawDate);

    const matchesText =
      (x.invoiceNo || x.InvoiceNo || '').toLowerCase().includes(txt) ||
      (x.storeName || x.StoreName || '').toLowerCase().includes(txt) ||
      (x.remarks || x.Remarks || '').toLowerCase().includes(txt);

    const matchesFrom = !from || purchaseDate >= from;
    const matchesTo = !to || purchaseDate <= to;

    return matchesText && matchesFrom && matchesTo;
  });
}

  openAddModal(): void {
    this.purchaseForm = {
       id: 0,
       purchaseType: 'Purchase',
       invoiceNo: '',
       storeName: '',
       sponsorName: '',
       purchaseDate: '',
       currency: 'AED',
       conversionRate: 1,
       totalCost: 0,
       totalCostAed: 0,
       remarks: '',
       details: []
      };

    this.addRow();
    this.showAddModal = true;
  }

  calculateAed(): void {
  const total = Number(this.purchaseForm.totalCost) || 0;
  const rate = Number(this.purchaseForm.conversionRate) || 1;

  this.purchaseForm.totalCostAed =
    this.purchaseForm.currency === 'AED'
      ? total
      : total / rate;
}

  savePurchase(): void {

    if (!this.purchaseForm.purchaseDate) {
      alert('Purchase Date is required');
      return;
    }

    if (this.purchaseForm.purchaseType === 'Purchase') {
    if (!this.purchaseForm.invoiceNo?.trim()) {
          alert('Invoice No is required');
          return;
        }

  if (!this.purchaseForm.storeName?.trim()) {
    alert('Store Name is required');
    return;
  }
}
    const payload = {
  invoiceNo: this.purchaseForm.invoiceNo,
  storeName: this.purchaseForm.storeName,
  purchaseDate: this.purchaseForm.purchaseDate,
  totalCost: Number(this.purchaseForm.totalCost),
  remarks: this.purchaseForm.remarks,

  purchaseType: this.purchaseForm.purchaseType,
  currency: this.purchaseForm.currency,
  conversionRate: Number(this.purchaseForm.conversionRate),
  totalCostAed: Number(this.purchaseForm.totalCostAed),
  sponsorName: this.purchaseForm.sponsorName,

  createdBy: this.userName,

  details: this.purchaseForm.details.map((x: any) => ({
    isbn: x.isbn,
    shelfId: Number(x.shelfId),
    rackId: Number(x.rackId),
    noOfCopies: Number(x.noOfCopies),
    cost: Number(x.cost),
    remarks: x.remarks
  }))
};

    this.api.saveBookPurchase(payload).subscribe({
      next: () => {
        alert('Purchase added successfully');
        this.closeModal();
        this.loadPurchases();
      },
      error: (err: any) => {
        console.log(err);
        alert('Error while saving purchase');
      }
    });
  }

  editPurchase(item: any): void {
    this.api.getBookPurchaseById(item.id || item.Id).subscribe({
      next: (res: any) => {
        const details = res.details?.$values || res.details || res.Details?.$values || res.Details || [];

        this.purchaseForm = {
  id: res.id || res.Id,

  purchaseType: res.purchaseType || res.PurchaseType || 'Purchase',

  invoiceNo: res.invoiceNo || res.InvoiceNo,

  storeName: res.storeName || res.StoreName,

  sponsorName: res.sponsorName || res.SponsorName || '',

  purchaseDate: this.formatDateForInput(
      res.purchaseDate || res.PurchaseDate
  ),

  currency: res.currency || res.Currency || 'AED',

  conversionRate:
      res.conversionRate || res.ConversionRate || 1,

  totalCost:
      res.totalCost || res.TotalCost || 0,

  totalCostAed:
      res.totalCostAed || res.TotalCostAed || 0,

  remarks: res.remarks || res.Remarks,

  details: details.map((d:any)=>({
      id: d.id || d.Id || 0,
      isbn: d.isbn || d.ISBN || '',
      title: d.title || d.Title || '',
      author: d.author || d.Author || '',
      publisher: d.publisher || d.Publisher || '',
      language: d.language || d.Language || '',
      category: d.category || d.Category || '',
      customBarcode: d.customBarcode || d.CustomBarcode || '',
      shelfId: d.shelfId || d.ShelfId || '',
      rackId: d.rackId || d.RackId || '',
      noOfCopies: d.noOfCopies || d.NoOfCopies || 1,
      cost: d.cost || d.Cost || 0,
      remarks: d.remarks || d.Remarks || ''
  }))
};

        this.showEditModal = true;
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load purchase');
      }
    });
  }

  updatePurchase(): void {
    
    
  if (!this.purchaseForm.invoiceNo?.trim()) {
    alert('Invoice No is required');
    return;
  }

  if (!this.purchaseForm.storeName?.trim()) {
    alert('Store Name is required');
    return;
  }

    const payload = {
  id: this.purchaseForm.id,

  invoiceNo: this.purchaseForm.invoiceNo,
  storeName: this.purchaseForm.storeName,
  purchaseDate: this.purchaseForm.purchaseDate,
  totalCost: Number(this.purchaseForm.totalCost),
  remarks: this.purchaseForm.remarks,

  purchaseType: this.purchaseForm.purchaseType,
  currency: this.purchaseForm.currency,
  conversionRate: Number(this.purchaseForm.conversionRate),
  totalCostAed: Number(this.purchaseForm.totalCostAed),
  sponsorName: this.purchaseForm.sponsorName,

  editedBy: this.userName,

  details: this.purchaseForm.details.map((x: any) => ({
      id: x.id || 0,
      isbn: x.isbn,
      shelfId: Number(x.shelfId),
      rackId: Number(x.rackId),
      noOfCopies: Number(x.noOfCopies),
      cost: Number(x.cost),
      remarks: x.remarks
  }))
};

    this.api.updateBookPurchase(this.purchaseForm.id, payload).subscribe({
      next: () => {
        alert('Purchase updated successfully');
        this.closeModal();
        this.loadPurchases();
      },
      error: (err: any) => {
        console.log(err);
        alert('Error while updating purchase');
      }
    });
  }

  deletePurchase(id: number): void {
    if (!confirm('Are you sure to delete this purchase?')) return;

    this.api.deleteBookPurchase(id, this.userName).subscribe({
      next: () => {
        alert('Purchase deleted successfully');
        this.loadPurchases();
      },
      error: (err: any) => {
        console.log(err);
        alert(err.error || 'Error while deleting purchase');
      }
    });
  }

  viewPurchase(item: any): void {
    this.api.getBookPurchaseById(item.id || item.Id).subscribe({
      next: (res: any) => {
        this.selectedPurchase = res;
        this.showViewModal = true;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  addRow(): void {
    this.purchaseForm.details.push({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      language: '',
      category: '',
      customBarcode: '',
      shelfId: '',
      rackId: '',
      noOfCopies: 1,
      cost: 0,
      remarks: ''
    });
  }

  removeRow(index: number): void {
    if (this.purchaseForm.details.length === 1) {
      alert('At least one row is required');
      return;
    }

    this.purchaseForm.details.splice(index, 1);
    this.calculateTotal();
  }

  onISBNChange(row: any): void {
    const book = this.books.find((x: any) =>
      (x.isbn || x.ISBN) === row.isbn
    );

    if (!book) return;

    row.title = book.title || book.Title || '';
    row.author = book.authorName || book.AuthorName || '';
    row.publisher = book.publisherName || book.PublisherName || '';
    row.language = book.languageName || book.LanguageName || '';
    row.category = book.categoryName || book.CategoryName || '';
    row.customBarcode = book.customBarcode || book.CustomBarcode || '';
  }

  calculateTotal(): void {
    let total = 0;

    this.purchaseForm.details.forEach((x: any) => {
      total += (Number(x.noOfCopies) || 0) * (Number(x.cost) || 0);
    });

    this.purchaseForm.totalCost = total;
    this.calculateAed();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB');
  }

  formatDateForInput(date: any): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  getShelfName(id: number): string {
    const shelf = this.shelves.find((x: any) => (x.id || x.Id) == id);
    return shelf?.shelfName || shelf?.ShelfName || shelf?.name || '';
  }

  getRackName(id: number): string {
    const rack = this.racks.find((x: any) => (x.id || x.Id) == id);
    return rack?.rackName || rack?.RackName || rack?.name || '';
  }
 
  printBarcode(item: any): void {
  this.api.getBookPurchaseById(item.id || item.Id).subscribe({
    next: (res: any) => {
      const details = res.details?.$values || res.details || [];

      let labelsHtml = '';

      details.forEach((d: any) => {
        const copies = d.copies?.$values || d.copies || [];

        copies.forEach((copy: any) => {
          for (let i = 0; i < 3; i++) {
            labelsHtml += `
              <div class="barcode-label">
                <div class="library-name">St. Thomas OCYM Library, Dubai</div>
                <div class="barcode-number">${copy.barcode}</div>
                <svg class="barcode-svg" data-barcode="${copy.barcode}"></svg>
                <div class="book-title">${d.title || ''}</div>
              </div>
            `;
          }
        });
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

        <body>
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

        // printWindow.focus();
       // printWindow.print();
      }, 500);
    },
    error: (err: any) => {
      console.log(err);
      alert('Failed to load barcode data');
    }
  });
}
   
  canView(): boolean {
  return ['Admin', 'Secretary', 'Treasurer', 'Internal Auditor', 'Librarian', 'Assistant Librarian']
    .includes(this.userType);
}

canAddPurchase(): boolean {
  return ['Admin', 'Secretary', 'Librarian', 'Assistant Librarian']
    .includes(this.userType);
}

canEdit(): boolean {
  return ['Admin', 'Secretary', 'Librarian', 'Assistant Librarian']
    .includes(this.userType);
}

canDelete(): boolean {
  return ['Admin', 'Secretary']
    .includes(this.userType);
}
}