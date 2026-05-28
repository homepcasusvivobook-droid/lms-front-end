import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-rack',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rack.html',
  styleUrl: './rack.css'
})
export class Rack implements OnInit {

  racks: any[] = [];
  shelves: any[] = [];
  searchText = '';

  showForm = false;
  isEdit = false;

  rackForm: any = {
    id: 0,
    rackCode: '',
    rackName: '',
    shelfId: 0
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadShelves();
    this.loadRacks();
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

  getId(rack: any): number {
    return rack.id || rack.Id || 0;
  }

  getRackCode(rack: any): string {
    return rack.rackCode || rack.RackCode || '';
  }

  getRackName(rack: any): string {
    return rack.rackName || rack.RackName || '';
  }

  getShelfId(rack: any): number {
    return rack.shelfId || rack.ShelfId || 0;
  }

  getShelfName(rack: any): string {
    return rack.shelfName || rack.ShelfName || '';
  }

  getShelfCode(shelf: any): string {
    return shelf.shelfCode || shelf.ShelfCode || '';
  }

  getShelfNameFromShelf(shelf: any): string {
    return shelf.shelfName || shelf.ShelfName || '';
  }

  loadShelves(): void {
    this.api.getShelves().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data?.$values || []);

        this.shelves = list.sort((a: any, b: any) =>
          this.getShelfCode(a).localeCompare(this.getShelfCode(b))
        );
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load shelves');
      }
    });
  }

  loadRacks(): void {
    this.api.getRacks().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data?.$values || []);

        this.racks = list.sort((a: any, b: any) =>
          this.getRackCode(a).localeCompare(this.getRackCode(b))
        );
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load racks');
      }
    });
  }

  get filteredRacks() {
    const search = this.searchText.toLowerCase();

    return this.racks.filter((x: any) =>
      this.getId(x).toString().includes(search) ||
      this.getRackCode(x).toLowerCase().includes(search) ||
      this.getRackName(x).toLowerCase().includes(search) ||
      this.getShelfName(x).toLowerCase().includes(search)
    );
  }

  addRack(): void {
    this.isEdit = false;

    this.rackForm = {
      id: 0,
      rackCode: '',
      rackName: '',
      shelfId: 0
    };

    this.showForm = true;
  }

  editRack(rack: any): void {
    this.isEdit = true;

    this.rackForm = {
      id: this.getId(rack),
      rackCode: this.getRackCode(rack),
      rackName: this.getRackName(rack),
      shelfId: this.getShelfId(rack)
    };

    this.showForm = true;
  }

  saveRack(): void {
    if (!this.rackForm.rackCode?.trim()) {
      alert('Enter Rack Code');
      return;
    }

    if (!this.rackForm.rackName?.trim()) {
      alert('Enter Rack Name');
      return;
    }

    if (!this.rackForm.shelfId || Number(this.rackForm.shelfId) <= 0) {
      alert('Select Shelf');
      return;
    }

    const duplicateCode = this.racks.find((x: any) =>
      this.getRackCode(x).toLowerCase() ===
      this.rackForm.rackCode.trim().toLowerCase() &&
      this.getId(x) !== this.rackForm.id
    );

    if (duplicateCode) {
      alert('Rack Code already exists');
      return;
    }

    const payload = {
      id: this.rackForm.id,
      rackCode: this.rackForm.rackCode.trim(),
      rackName: this.rackForm.rackName.trim(),
      shelfId: Number(this.rackForm.shelfId)
    };

    if (this.isEdit) {
      this.api.updateRack(this.rackForm.id, payload).subscribe({
        next: () => {
          alert('Rack updated successfully');
          this.showForm = false;
          this.loadRacks();
        },
        error: (err: any) => {
          console.log(err);
          alert(err?.error?.message || err?.error || err?.message || 'Failed to update rack');
        }
      });

      return;
    }

    this.api.createRack(payload).subscribe({
      next: () => {
        alert('Rack added successfully');
        this.showForm = false;
        this.loadRacks();
      },
      error: (err: any) => {
        console.log(err);
        alert(err?.error?.message || err?.error || err?.message || 'Failed to save rack');
      }
    });
  }

  deleteRack(rack: any): void {
    if (!confirm('Are you sure to delete this rack?')) {
      return;
    }

    this.api.deleteRack(this.getId(rack)).subscribe({
      next: () => {
        alert('Rack deleted successfully');
        this.loadRacks();
      },
      error: (err: any) => {
        console.log(err);
        alert(err?.error?.message || err?.error || err?.message || 'Failed to delete rack');
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
  }
}