import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './languages.html',
  styleUrl: './languages.css'
})
export class Languages implements OnInit {

  languages: any[] = [];
  searchText = '';

  showForm = false;
  isEdit = false;

  languageForm: any = {
    id: 0,
    languageName: '',
    languagePrefix: ''
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadLanguages();
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

  getId(language: any): number {
    return language.id || language.Id || 0;
  }

  getLanguageName(language: any): string {
    return language.languageName || language.LanguageName || language.name || language.Name || '';
  }

  getLanguagePrefix(language: any): string {
    return language.languagePrefix || language.LanguagePrefix || '';
  }

  loadLanguages(): void {
    this.api.getLanguages().subscribe({
      next: (data: any) => {
        this.languages = Array.isArray(data)
          ? data
          : (data?.$values || []);
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load languages');
      }
    });
  }

  get filteredLanguages() {
    const search = this.searchText.toLowerCase().trim();

    return this.languages
      .filter((x: any) =>
        this.getId(x).toString().includes(search) ||
        this.getLanguageName(x).toLowerCase().includes(search) ||
        this.getLanguagePrefix(x).toLowerCase().includes(search)
      )
      .sort((a: any, b: any) =>
        Number(this.getId(b)) - Number(this.getId(a))
      );
  }

  addLanguage(): void {
    this.isEdit = false;

    this.languageForm = {
      id: 0,
      languageName: '',
      languagePrefix: ''
    };

    this.showForm = true;
  }

  editLanguage(language: any): void {
    this.isEdit = true;

    this.languageForm = {
      id: this.getId(language),
      languageName: this.getLanguageName(language),
      languagePrefix: this.getLanguagePrefix(language)
    };

    this.showForm = true;
  }

  saveLanguage(): void {
    if (!this.languageForm.languageName?.trim()) {
      alert('Enter Language Name');
      return;
    }

    if (!this.languageForm.languagePrefix?.trim()) {
      alert('Enter Language Prefix');
      return;
    }

    const duplicatePrefix = this.languages.find((x: any) =>
      this.getLanguagePrefix(x).toLowerCase() ===
      this.languageForm.languagePrefix.trim().toLowerCase() &&
      this.getId(x) !== this.languageForm.id
    );

    if (duplicatePrefix) {
      alert('Language Prefix already exists');
      return;
    }

    const payload = {
      id: this.languageForm.id,
      languageName: this.languageForm.languageName.trim(),
      languagePrefix: this.languageForm.languagePrefix.trim(),
      name: this.languageForm.languageName.trim()
    };

    if (this.isEdit) {
      this.api.updateLanguage(this.languageForm.id, payload).subscribe({
        next: () => {
          alert('Language updated successfully');
          this.showForm = false;
          this.loadLanguages();
        },
        error: (err: any) => {
          console.log(err);
          alert(err?.error || 'Failed to update language');
        }
      });

      return;
    }

    this.api.createLanguage(payload).subscribe({
      next: () => {
        alert('Language added successfully');
        this.showForm = false;
        this.loadLanguages();
      },
      error: (err: any) => {
        console.log(err);
        alert(err?.error || 'Failed to save language');
      }
    });
  }

  deleteLanguage(language: any): void {
    if (!confirm('Are you sure you want to delete this language?')) {
      return;
    }

    this.api.deleteLanguage(this.getId(language)).subscribe({
      next: () => {
        alert('Language deleted successfully');
        this.loadLanguages();
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to delete language');
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
  }
}