import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.html',
  styleUrl: './members.css'
})
export class Members implements OnInit {

  members: any[] = [];
  memberTypes: any[] = [];

  userType = localStorage.getItem('userType') || '';
  userName = localStorage.getItem('userName') || 'Admin';

  searchText = '';
  fromDate = '';
  toDate = '';
  isDateFilterApplied = false;

  showForm = false;
  showRenewal = false;

  isEdit = false;
  selectedMember: any = null;

  sortColumn = 'memberId';
  sortDirection: 'asc' | 'desc' = 'asc';

  memberForm: any = this.emptyMemberForm();

  renewalForm: any = {
    amount: 0,
    paymentDate: '',
    remarks: ''
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    this.fromDate = `${currentYear}-01-01`;
    this.toDate = `${currentYear}-12-31`;

    this.loadMembers();
    this.loadMemberTypes();
  }

  emptyMemberForm() {
    return {
    id: 0,
    memberId: '',
    cardexNo: '',
    memberName: '',
    phoneNo: '',
    email: '',
    address: '',
    parish: '',
    memberTypeId: null,
    createdBy: this.userName,
    editedBy: this.userName
  };
}

  loadMembers() {
    this.api.getMembers().subscribe({
      next: (data) => {
        this.members = data;
      },
      error: (err) => {
        console.error(err);
        alert('Error while loading members');
      }
    });
  }

  loadMemberTypes() {
  this.api.getMemberTypes().subscribe({
    next: (data) => {
      this.memberTypes = data;
    },
    error: (err) => {
      console.error(err);
    }
  });
}

  searchMembers() {
    this.isDateFilterApplied = true;
  }

  exportMembersToExcel(): void {
    try {
      const exportData = this.filteredMembers.map((m: any) => ({
        Id: m.id ?? '',
        CardexNo: m.cardexNo ?? '',
        MemberName: m.memberName ?? '',
        PhoneNo: m.phoneNo ?? '',
        Email: m.email ?? '',
        Address: m.address ?? '',
        IsActive: m.isActive ? 'Active' : 'Inactive',
        CreatedDate: this.formatDateOnly(m.createdDate),
        MemberId: m.memberId ?? '',
        Parish: m.parish ?? '',
        MemberType: m.memberTypeName ?? '',
        CreatedBy: m.createdBy ?? '',

        MembershipStatus: m.membershipStatus ?? '',

        Amount: m.amount ?? '',
        PaymentDate: this.formatDateOnly(m.paymentDate),
        ValidFrom: this.formatDateOnly(m.validFrom),
        ValidTo: this.formatDateOnly(m.validTo),
        Remarks: m.remarks ?? '',
        RenewalCreatedDate: this.formatDateOnly(m.renewalCreatedDate),
        RenewalCreatedBy: m.renewalCreatedBy ?? ''
      }));

      if (exportData.length === 0) {
        alert('No records found');
        return;
      }

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

      const workbook: XLSX.WorkBook = {
        Sheets: {
          Members: worksheet
        },
        SheetNames: ['Members']
      };

      XLSX.writeFile(workbook, 'Members.xlsx');
    } catch (error) {
      console.error('EXPORT ERROR:', error);
      alert('Error while exporting excel');
    }
  }

  formatDateOnly(value: any): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  addMember() {
    this.isEdit = false;
    this.memberForm = this.emptyMemberForm();
    this.showForm = true;
  }

  editMember(member: any) {
    this.isEdit = true;

    this.memberForm = {
      id: member.id,
      memberId: member.memberId,
      cardexNo: member.cardexNo,
      memberName: member.memberName,
      phoneNo: member.phoneNo,
      email: member.email,
      address: member.address,
      parish: member.parish,
      memberTypeId: member.memberTypeId,
      createdBy: member.createdBy || 'Admin',
      editedBy: this.userName
    };

    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  saveMember() {
    if (!this.memberForm.cardexNo || !this.memberForm.memberName) {
      alert('Cardex No and Member Name are required');
      return;
    }

    const payload = {
      id: this.memberForm.id,
      memberId: this.memberForm.memberId,
      cardexNo: this.memberForm.cardexNo,
      memberName: this.memberForm.memberName,
      phoneNo: this.memberForm.phoneNo,
      email: this.memberForm.email,
      address: this.memberForm.address,
      parish: this.memberForm.parish,
      memberTypeId: this.memberForm.memberTypeId,
      createdBy: this.memberForm.createdBy || this.userName,
      editedBy: this.userName
    };

    if (this.isEdit) {
      this.api.updateMember(this.memberForm.id, payload).subscribe({
        next: () => {
          alert('Member updated successfully');
          this.showForm = false;
          this.loadMembers();
        },
        error: (err) => {
          console.error('UPDATE MEMBER ERROR:', err);
          alert(err?.error || 'Error while updating member');
        }
      });
    } else {
      this.api.saveMember(payload).subscribe({
        next: () => {
          alert('Member saved successfully');
          this.showForm = false;
          this.loadMembers();
        },
        error: (err) => {
          console.error('SAVE MEMBER ERROR:', err);
          alert(err?.error || 'Error while saving member');
        }
      });
    }
  }

  deleteMember(member: any) {
    if (!confirm('Are you sure you want to delete this member?')) {
      return;
    }

    this.api.deleteMember(member.id, this.userName).subscribe({
      next: () => {
        alert('Member deleted successfully');
        this.loadMembers();
      },
      error: (err) => {
        console.error(err);
        alert('Error while deleting member');
      }
    });
  }

  openRenewal(member: any) {
    this.selectedMember = member;

    const today = new Date().toISOString().substring(0, 10);

    this.renewalForm = {
      amount: 0,
      paymentDate: today,
      remarks: ''
    };

    this.showRenewal = true;
  }

  closeRenewal() {
    this.showRenewal = false;
    this.selectedMember = null;
  }

  saveRenewal() {
    if (!this.renewalForm.amount || this.renewalForm.amount <= 0) {
      alert('Enter renewal amount');
      return;
    }

    const data = {
      memberDbId: this.selectedMember.id,
      amount: Number(this.renewalForm.amount),
      paymentDate: this.renewalForm.paymentDate,
      remarks: this.renewalForm.remarks,
      createdBy: this.userName
    };

    this.api.renewMembership(data).subscribe({
      next: () => {
        alert('Membership renewed successfully');
        this.showRenewal = false;
        this.loadMembers();
      },
      error: (err) => {
        console.error(err);
        alert('Error while renewing membership');
      }
    });
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get filteredMembers() {
    const search = this.searchText.toLowerCase();

    const from = this.fromDate ? new Date(this.fromDate + 'T00:00:00') : null;
    const to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;

    let filtered = this.members.filter(x => {
      const filterDate = x.expiredOn ? new Date(x.expiredOn) : null;

      let dateMatch = true;

      if (this.isDateFilterApplied && (from || to)) {
        if (!filterDate) {
          dateMatch = false;
        }

        if (filterDate && from && filterDate < from) {
          dateMatch = false;
        }

        if (filterDate && to && filterDate > to) {
          dateMatch = false;
        }
      }

      const textMatch =
        x.memberId?.toString().toLowerCase().includes(search) ||
        x.cardexNo?.toString().toLowerCase().includes(search) ||
        x.memberName?.toString().toLowerCase().includes(search) ||
        x.phoneNo?.toString().toLowerCase().includes(search) ||
        x.email?.toString().toLowerCase().includes(search) ||
        x.address?.toString().toLowerCase().includes(search) ||
        x.parish?.toString().toLowerCase().includes(search) ||
        x.membershipStatus?.toString().toLowerCase().includes(search);
        x.memberTypeName?.toString().toLowerCase().includes(search);

      return textMatch && dateMatch;
    });

    filtered.sort((a: any, b: any) => {
      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];

      if (valueA == null) valueA = '';
      if (valueB == null) valueB = '';

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });

    return filtered;
  }
  canExportExcel(): boolean {
  return ['Admin', 'Secretary', 'Treasurer', 'Internal Auditor', 'Librarian', 'Assistant Librarian']
    .includes(this.userType);
}

canAddMember(): boolean {
  return ['Admin', 'Secretary', 'Treasurer', 'Librarian', 'Assistant Librarian']
    .includes(this.userType);
}

canRenewal(): boolean {
  return ['Admin', 'Secretary', 'Treasurer', 'Librarian', 'Assistant Librarian']
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