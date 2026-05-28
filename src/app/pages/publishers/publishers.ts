import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-publishers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publishers.html',
  styleUrl: './publishers.css'
})
export class Publishers implements OnInit {

  publishers: any[] = [];
  searchText = '';

  showForm = false;
  isEdit = false;

  publisherForm: any = {
    id: 0,
    name: ''
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadPublishers();
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

  getId(publisher: any): number {
    return publisher.id || publisher.Id;
  }

  getName(publisher: any): string {
    return publisher.name || publisher.Name || publisher.publisherName || publisher.PublisherName || '';
  }

  loadPublishers() {
    this.api.getPublishers().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data?.$values || []);

        this.publishers = list.sort((a: any, b: any) =>
          this.getName(a).localeCompare(this.getName(b))
        );
      },
      error: (err: any) => {
        console.error(err);
        alert('Error loading publishers');
      }
    });
  }

  get filteredPublishers() {
    const search = this.searchText.toLowerCase();

    return this.publishers.filter((x: any) =>
      this.getName(x).toLowerCase().includes(search)
    );
  }

  addPublisher() {
    this.isEdit = false;

    this.publisherForm = {
      id: 0,
      name: ''
    };

    this.showForm = true;
  }

  editPublisher(publisher: any) {
    this.isEdit = true;

    this.publisherForm = {
      id: this.getId(publisher),
      name: this.getName(publisher)
    };

    this.showForm = true;
  }

  savePublisher() {
    if (!this.publisherForm.name || this.publisherForm.name.trim() === '') {
      alert('Enter publisher name');
      return;
    }

    const payload = {
      id: this.publisherForm.id,
      name: this.publisherForm.name.trim()
    };

    if (this.isEdit) {
      this.api.updatePublisher(this.publisherForm.id, payload).subscribe({
        next: () => {
          alert('Publisher updated successfully');
          this.showForm = false;
          this.loadPublishers();
        },
        error: (err: any) => {
          console.error(err);
          alert('Error updating publisher');
        }
      });

      return;
    }

    this.api.createPublisher(payload).subscribe({
      next: () => {
        alert('Publisher added successfully');
        this.showForm = false;
        this.loadPublishers();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error saving publisher');
      }
    });
  }

  deletePublisher(publisher: any) {
    if (!confirm('Are you sure you want to delete this publisher?')) {
      return;
    }

    this.api.deletePublisher(this.getId(publisher)).subscribe({
      next: () => {
        alert('Publisher deleted successfully');
        this.loadPublishers();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error deleting publisher');
      }
    });
  }

  closeForm() {
    this.showForm = false;
  }
}