import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-shelf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shelf.html',
  styleUrl: './shelf.css'
})
export class Shelf implements OnInit {

  shelves: any[] = [];
  searchText = '';

  showForm = false;
  isEdit = false;

  shelfForm: any = {
    id: 0,
    shelfCode: '',
    shelfName: ''
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadShelves();
  }

  getUserRole(): string {
    return (
      localStorage.getItem('userType') ||
      localStorage.getItem('role') ||
      localStorage.getItem('userTypeName') ||
      ''
    ).toLowerCase().trim();
  }

  canAdd(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'secretary' || role === 'librarian';
  }

  canEdit(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'secretary' || role === 'librarian';
  }

  canDelete(): boolean {
    return this.getUserRole() === 'admin';
  }

  getId(shelf: any): number {
    return shelf.id || shelf.Id || 0;
  }

  getShelfCode(shelf: any): string {
    return shelf.shelfCode || shelf.ShelfCode || '';
  }

  getShelfName(shelf: any): string {
    return shelf.shelfName || shelf.ShelfName || '';
  }

  loadShelves(): void {
  this.api.getShelves().subscribe({
    next: (data: any) => {
      this.shelves = Array.isArray(data)
        ? data
        : (data?.$values || []);

      this.shelves.sort((a: any, b: any) => {
        const idA = Number(a.id || a.Id || 0);
        const idB = Number(b.id || b.Id || 0);

        return idB - idA;
      });
    },
    error: (err: any) => {
      console.log(err);
      alert('Failed to load shelves');
    }
  });
}
    
  get filteredShelves() {
    const search = this.searchText.toLowerCase();

    return this.shelves.filter((x: any) =>
      this.getId(x).toString().includes(search) ||
      this.getShelfCode(x).toLowerCase().includes(search) ||
      this.getShelfName(x).toLowerCase().includes(search)
    );
  }

  addShelf(): void {
    this.isEdit = false;

    this.shelfForm = {
      id: 0,
      shelfCode: '',
      shelfName: ''
    };

    this.showForm = true;
  }

  editShelf(shelf: any): void {
    this.isEdit = true;

    this.shelfForm = {
      id: this.getId(shelf),
      shelfCode: this.getShelfCode(shelf),
      shelfName: this.getShelfName(shelf)
    };

    this.showForm = true;
  }

  saveShelf(): void {
    if (!this.shelfForm.shelfCode?.trim()) {
      alert('Enter Shelf Code');
      return;
    }

    if (!this.shelfForm.shelfName?.trim()) {
      alert('Enter Shelf Name');
      return;
    }

    const duplicateCode = this.shelves.find((x: any) =>
      this.getShelfCode(x).toLowerCase() ===
      this.shelfForm.shelfCode.trim().toLowerCase() &&
      this.getId(x) !== this.shelfForm.id
    );

    if (duplicateCode) {
      alert('Shelf Code already exists');
      return;
    }

    const payload = {
      id: this.shelfForm.id,
      shelfCode: this.shelfForm.shelfCode.trim(),
      shelfName: this.shelfForm.shelfName.trim()
    };

    if (this.isEdit) {
      this.api.updateShelf(this.shelfForm.id, payload).subscribe({
        next: () => {
          alert('Shelf updated successfully');
          this.showForm = false;
          this.loadShelves();
        },
        error: (err: any) => {
          console.log(err);
          alert(err?.error?.message || err?.error || err?.message || 'Failed to update shelf');
        }
      });

      return;
    }

    this.api.createShelf(payload).subscribe({
      next: () => {
        alert('Shelf added successfully');
        this.showForm = false;
        this.loadShelves();
      },
      error: (err: any) => {
        console.log(err);
        alert(err?.error?.message || err?.error || err?.message || 'Failed to save shelf');
      }
    });
  }

  deleteShelf(shelf: any): void {
    if (!confirm('Are you sure to delete this shelf?')) {
      return;
    }

    this.api.deleteShelf(this.getId(shelf)).subscribe({
      next: () => {
        alert('Shelf deleted successfully');
        this.loadShelves();
      },
      error: (err: any) => {
        console.log(err);
        alert(err?.error?.message || err?.error || err?.message || 'Failed to delete shelf');
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
  }
}