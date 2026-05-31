import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currencies.html',
  styleUrl: './currencies.css'
})
export class Currencies implements OnInit {

  currencies: any[] = [];
  filteredCurrencies: any[] = [];

  searchText = '';

  showModal = false;
  isEditMode = false;
  editingId: number | null = null;

  userName = localStorage.getItem('userName') || 'Admin';
  userType = localStorage.getItem('userType') || localStorage.getItem('role') || '';

  currencyForm: any = {
    currencyCode: '',
    currencyName: '',
    isDefault: false,
    isActive: true
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.api.getCurrencies().subscribe({
      next: (res: any) => {
        this.currencies = Array.isArray(res) ? res : (res?.$values || []);
        this.applyCurrencyFilter();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error while loading currencies');
      }
    });
  }

  onSearch(): void {
    this.applyCurrencyFilter();
  }

  applyCurrencyFilter(): void {
    const text = this.searchText.toLowerCase().trim();

    this.filteredCurrencies = this.currencies
      .filter((x: any) =>
        String(x.id || '').includes(text) ||
        (x.currencyCode || '').toLowerCase().includes(text) ||
        (x.currencyName || '').toLowerCase().includes(text)
      )
      .sort((a: any, b: any) =>
        Number(b.id || 0) - Number(a.id || 0)
      );
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;

    this.currencyForm = {
      currencyCode: '',
      currencyName: '',
      isDefault: false,
      isActive: true
    };

    this.showModal = true;
  }

  editCurrency(item: any): void {
    this.isEditMode = true;
    this.editingId = item.id;

    this.currencyForm = {
      currencyCode: item.currencyCode,
      currencyName: item.currencyName,
      isDefault: item.isDefault,
      isActive: item.isActive
    };

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCurrency(): void {
    this.currencyForm.currencyCode =
      this.currencyForm.currencyCode?.trim().toUpperCase() || '';

    this.currencyForm.currencyName =
      this.currencyForm.currencyName?.trim() || '';

    if (!this.currencyForm.currencyCode) {
      alert('Currency Code is required');
      return;
    }

    if (!this.currencyForm.currencyName) {
      alert('Currency Name is required');
      return;
    }

    const payload = {
      ...this.currencyForm,
      createdBy: this.userName
    };

    this.api.saveCurrency(payload).subscribe({
      next: () => {
        alert('Currency saved successfully');
        this.closeModal();
        this.loadCurrencies();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error while saving currency');
      }
    });
  }

  updateCurrency(): void {
    if (!this.editingId) return;

    this.currencyForm.currencyCode =
      this.currencyForm.currencyCode?.trim().toUpperCase() || '';

    this.currencyForm.currencyName =
      this.currencyForm.currencyName?.trim() || '';

    if (!this.currencyForm.currencyCode) {
      alert('Currency Code is required');
      return;
    }

    if (!this.currencyForm.currencyName) {
      alert('Currency Name is required');
      return;
    }

    const payload = {
      id: this.editingId,
      ...this.currencyForm,
      editedBy: this.userName
    };

    this.api.updateCurrency(this.editingId, payload).subscribe({
      next: () => {
        alert('Currency updated successfully');
        this.closeModal();
        this.loadCurrencies();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error while updating currency');
      }
    });
  }

  deleteCurrency(id: number): void {
    if (!confirm('Are you sure you want to delete this currency?')) {
      return;
    }

    this.api.deleteCurrency(id, this.userName).subscribe({
      next: () => {
        alert('Currency deleted successfully');
        this.loadCurrencies();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error while deleting currency');
      }
    });
  }

  canAdd(): boolean {
    return ['Admin', 'Secretary'].includes(this.userType);
  }

  canEdit(): boolean {
    return ['Admin', 'Secretary'].includes(this.userType);
  }

  canDelete(): boolean {
    return ['Admin', 'Secretary'].includes(this.userType);
  }
}