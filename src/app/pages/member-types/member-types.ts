import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Api } from '../../services/api';

@Component({
  selector: 'app-member-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-types.html',
  styleUrls: ['./member-types.css']
})
export class MemberTypes implements OnInit {

  memberTypes: any[] = [];

  showModal = false;
  isEdit = false;

  formData: any = {
    id: 0,
    memberTypeName: '',
    prefix: '',
    maxBooksAllowed: 0,
    isActive: true
  };

  constructor(private api: Api) { }

  ngOnInit(): void {
    this.loadMemberTypes();
  }

  getId(item: any): number {
    return Number(item.id || item.Id || 0);
  }

  getMemberTypeName(item: any): string {
    return item.memberTypeName || item.MemberTypeName || '';
  }

  getPrefix(item: any): string {
    return item.prefix || item.Prefix || '';
  }

  getMaxBooksAllowed(item: any): number {
    return Number(item.maxBooksAllowed || item.MaxBooksAllowed || 0);
  }

  getIsActive(item: any): boolean {
    return item.isActive ?? item.IsActive ?? true;
  }

  loadMemberTypes(): void {
    this.api.getMemberTypes().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.$values || []);

        this.memberTypes = list.sort((a: any, b: any) =>
          this.getId(b) - this.getId(a)
        );
      },
      error: (err: any) => {
        console.log(err);
        alert('Failed to load member types');
      }
    });
  }

  openAddModal(): void {
    this.isEdit = false;

    this.formData = {
      id: 0,
      memberTypeName: '',
      prefix: '',
      maxBooksAllowed: 0,
      isActive: true
    };

    this.showModal = true;
  }

  openEditModal(data: any): void {
    this.isEdit = true;

    this.formData = {
      id: this.getId(data),
      memberTypeName: this.getMemberTypeName(data),
      prefix: this.getPrefix(data),
      maxBooksAllowed: this.getMaxBooksAllowed(data),
      isActive: this.getIsActive(data)
    };

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMemberType(): void {
    if (!this.formData.memberTypeName?.trim()) {
      alert('Enter Member Type');
      return;
    }

    if (!this.formData.prefix?.trim()) {
      alert('Enter Prefix');
      return;
    }

    if (Number(this.formData.maxBooksAllowed) <= 0) {
      alert('Enter valid Max Books Allowed');
      return;
    }

    this.formData.memberTypeName = this.formData.memberTypeName.trim();
    this.formData.prefix = this.formData.prefix.trim().toUpperCase();

    if (this.isEdit) {
      this.api.updateMemberType(this.formData.id, this.formData)
        .subscribe({
          next: () => {
            alert('Updated Successfully');
            this.closeModal();
            this.loadMemberTypes();
          },
          error: (err: any) => {
            console.log(err);
            alert(err?.error || 'Failed to update member type');
          }
        });

      return;
    }

    this.api.addMemberType(this.formData)
      .subscribe({
        next: () => {
          alert('Saved Successfully');
          this.closeModal();
          this.loadMemberTypes();
        },
        error: (err: any) => {
          console.log(err);
          alert(err?.error || 'Failed to save member type');
        }
      });
  }

  deleteMemberType(id: number): void {
    if (!confirm('Are you sure to delete?')) {
      return;
    }

    this.api.deleteMemberType(id)
      .subscribe({
        next: () => {
          alert('Deleted Successfully');
          this.loadMemberTypes();
        },
        error: (err: any) => {
          console.log(err);
          alert('Failed to delete member type');
        }
      });
  }
}