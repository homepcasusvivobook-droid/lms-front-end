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
    maxBooksAllowed: 0,
    isActive: true
  };

  constructor(private api: Api) { }

  ngOnInit(): void {
    this.loadMemberTypes();
  }

  loadMemberTypes() {
    this.api.getMemberTypes().subscribe({
      next: (res: any) => {
        this.memberTypes = res;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  openAddModal() {

    this.isEdit = false;

    this.formData = {
      id: 0,
      memberTypeName: '',
      maxBooksAllowed: 0,
      isActive: true
    };

    this.showModal = true;
  }

  openEditModal(data: any) {

    this.isEdit = true;

    this.formData = { ...data };

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveMemberType() {

    if (this.isEdit) {

      this.api.updateMemberType(this.formData.id, this.formData)
        .subscribe({
          next: () => {
            alert('Updated Successfully');
            this.closeModal();
            this.loadMemberTypes();
          },
          error: (err) => {
            console.log(err);
          }
        });

    } else {

      this.api.addMemberType(this.formData)
        .subscribe({
          next: () => {
            alert('Saved Successfully');
            this.closeModal();
            this.loadMemberTypes();
          },
          error: (err) => {
            console.log(err);
          }
        });

    }
  }

  deleteMemberType(id: number) {

    if (confirm('Are you sure to delete?')) {

      this.api.deleteMemberType(id)
        .subscribe({
          next: () => {
            alert('Deleted Successfully');
            this.loadMemberTypes();
          },
          error: (err) => {
            console.log(err);
          }
        });

    }
  }

}