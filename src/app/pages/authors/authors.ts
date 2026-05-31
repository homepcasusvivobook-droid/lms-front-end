import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authors.html',
  styleUrl: './authors.css'
})
export class Authors implements OnInit {

  authors: any[] = [];
  searchText = '';

  showForm = false;
  isEdit = false;

  authorForm: any = {
    id: 0,
    name: ''
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadAuthors();
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

  getId(author: any): number {
    return author.id || author.Id;
  }

  getName(author: any): string {
    return author.name || author.Name || author.authorName || author.AuthorName || '';
  }

  loadAuthors() {
    this.api.getAuthors().subscribe({
      next: (data: any) => {
        this.authors = Array.isArray(data) ? data : (data?.$values || []);
      },
      error: (err: any) => {
        console.error(err);
        alert('Error loading authors');
      }
    });
  }

  get filteredAuthors() {
  const search = this.searchText.toLowerCase().trim();

  return this.authors
    .filter((x: any) =>
      this.getName(x).toLowerCase().includes(search)
    )
    .sort((a: any, b: any) =>
      Number(this.getId(b)) - Number(this.getId(a))
    );
}

  addAuthor() {
    this.isEdit = false;

    this.authorForm = {
      id: 0,
      name: ''
    };

    this.showForm = true;
  }

  editAuthor(author: any) {
    this.isEdit = true;

    this.authorForm = {
      id: this.getId(author),
      name: this.getName(author)
    };

    this.showForm = true;
  }

  saveAuthor() {
    if (!this.authorForm.name || this.authorForm.name.trim() === '') {
      alert('Enter author name');
      return;
    }

    const payload = {
      id: this.authorForm.id,
      name: this.authorForm.name.trim()
    };

    if (this.isEdit) {
      this.api.updateAuthor(this.authorForm.id, payload).subscribe({
        next: () => {
          alert('Author updated successfully');
          this.showForm = false;
          this.loadAuthors();
        },
        error: (err: any) => {
          console.error(err);
          alert('Error updating author');
        }
      });

      return;
    }

    this.api.createAuthor(payload).subscribe({
      next: () => {
        alert('Author added successfully');
        this.showForm = false;
        this.loadAuthors();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error saving author');
      }
    });
  }

  deleteAuthor(author: any) {
    if (!confirm('Are you sure you want to delete this author?')) {
      return;
    }

    this.api.deleteAuthor(
  this.getId(author),
  localStorage.getItem('userName') || 'Admin'
).subscribe({
      next: () => {
        alert('Author deleted successfully');
        this.loadAuthors();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error deleting author');
      }
    });
  }

  closeForm() {
    this.showForm = false;
  }
}