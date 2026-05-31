import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  categories: any[] = [];
  searchText = '';

  showForm = false;
  isEdit = false;

  categoryForm: any = {
    id: 0,
    categoryCode: '',
    categoryName: '',
    categoryPrefix: ''
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadCategories();
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

  getId(category: any): number {
    return Number(category.id || category.Id || 0);
  }

  getCategoryCode(category: any): string {
    return category.categoryCode || category.CategoryCode || '';
  }

  getCategoryName(category: any): string {
    return category.categoryName || category.CategoryName || category.name || category.Name || '';
  }

  getCategoryPrefix(category: any): string {
    return category.categoryPrefix || category.CategoryPrefix || '';
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data)
          ? data
          : (data?.$values || []);

        this.categories = list.sort((a: any, b: any) => {
          return this.getId(a) - this.getId(b);
        });
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load categories');
      }
    });
  }

  get filteredCategories() {
  const search = this.searchText.toLowerCase().trim();

  return this.categories
    .filter((x: any) =>
      this.getId(x).toString().includes(search) ||
      this.getCategoryCode(x).toLowerCase().includes(search) ||
      this.getCategoryName(x).toLowerCase().includes(search) ||
      this.getCategoryPrefix(x).toLowerCase().includes(search)
    )
    .sort((a: any, b: any) =>
      Number(this.getId(b)) - Number(this.getId(a))
    );
}

  addCategory(): void {
    this.isEdit = false;

    this.categoryForm = {
      id: 0,
      categoryCode: '',
      categoryName: '',
      categoryPrefix: ''
    };

    this.showForm = true;
  }

  editCategory(category: any): void {
    this.isEdit = true;

    this.categoryForm = {
      id: this.getId(category),
      categoryCode: this.getCategoryCode(category),
      categoryName: this.getCategoryName(category),
      categoryPrefix: this.getCategoryPrefix(category)
    };

    this.showForm = true;
  }

  saveCategory(): void {
    if (!this.categoryForm.categoryCode?.trim()) {
      alert('Enter Category Code');
      return;
    }

    if (!this.categoryForm.categoryName?.trim()) {
      alert('Enter Category Name');
      return;
    }

    if (!this.categoryForm.categoryPrefix?.trim()) {
      alert('Enter Category Prefix');
      return;
    }

    const currentId = Number(this.categoryForm.id || 0);
    const code = this.categoryForm.categoryCode.trim().toLowerCase();
    const prefix = this.categoryForm.categoryPrefix.trim().toLowerCase();

    const duplicateCode = this.categories.find((x: any) =>
      this.getCategoryCode(x).trim().toLowerCase() === code &&
      this.getId(x) !== currentId
    );

    if (duplicateCode) {
      alert('Category Code already exists');
      return;
    }

    const duplicatePrefix = this.categories.find((x: any) =>
      this.getCategoryPrefix(x).trim().toLowerCase() === prefix &&
      this.getId(x) !== currentId
    );

    if (duplicatePrefix) {
      alert('Category Prefix already exists');
      return;
    }

    const payload = {
      id: currentId,
      categoryCode: this.categoryForm.categoryCode.trim(),
      categoryName: this.categoryForm.categoryName.trim(),
      categoryPrefix: this.categoryForm.categoryPrefix.trim(),
      name: this.categoryForm.categoryName.trim()
    };

    if (this.isEdit) {
      this.api.updateCategory(currentId, payload).subscribe({
        next: () => {
          alert('Category updated successfully');
          this.showForm = false;
          this.loadCategories();
        },
        error: (err: any) => {
          console.log(err);
          alert(err?.error || 'Failed to update category');
        }
      });

      return;
    }

    this.api.createCategory(payload).subscribe({
      next: () => {
        alert('Category added successfully');
        this.showForm = false;
        this.loadCategories();
      },
      error: (err: any) => {
        console.log(err);
        alert(err?.error || 'Failed to save category');
      }
    });
  }

  deleteCategory(category: any): void {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    this.api.deleteCategory(this.getId(category)).subscribe({
      next: () => {
        alert('Category deleted successfully');
        this.loadCategories();
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to delete category');
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
  }
}