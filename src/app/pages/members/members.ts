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

  sortColumn = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

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
      next: (data: any) => {
        const list = Array.isArray(data)
          ? data
          : (data?.$values || []);

        this.members = list.sort((a: any, b: any) =>
          Number(b.id || b.Id || 0) -
          Number(a.id || a.Id || 0)
        );
      },
      error: (err) => {
        console.error(err);
        alert('Error while loading members');
      }
    });
  }

  loadMemberTypes() {
    this.api.getMemberTypes().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data)
          ? data
          : (data?.$values || []);

        this.memberTypes = list
          .filter((x: any) => x.isActive ?? x.IsActive ?? true)
          .sort((a: any, b: any) =>
            Number(a.id || a.Id || 0) -
            Number(b.id || b.Id || 0)
          );
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
        MemberId: m.memberId ?? '',
        CardexNo: m.cardexNo ?? '',
        MemberName: m.memberName ?? '',
        PhoneNo: m.phoneNo ?? '',
        Email: m.email ?? '',
        Address: m.address ?? '',
        Parish: m.parish ?? '',
        MemberType: m.memberTypeName ?? '',
        IsActive: m.isActive ? 'Active' : 'Inactive',
        CreatedDate: this.formatDateOnly(m.createdDate),
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
      id: member.id || member.Id,
      memberId: member.memberId || member.MemberId || '',
      cardexNo: member.cardexNo || member.CardexNo || '',
      memberName: member.memberName || member.MemberName || '',
      phoneNo: member.phoneNo || member.PhoneNo || '',
      email: member.email || member.Email || '',
      address: member.address || member.Address || '',
      parish: member.parish || member.Parish || '',
      memberTypeId: member.memberTypeId || member.MemberTypeId || null,
      createdBy: member.createdBy || member.CreatedBy || 'Admin',
      editedBy: this.userName
    };

    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  saveMember() {
    if (
      !this.memberForm.cardexNo ||
      !this.memberForm.memberName ||
      !this.memberForm.memberTypeId
    ) {
      alert('Cardex No, Member Name and Member Type are required');
      return;
    }

    const payload = {
      id: this.memberForm.id,

      // Backend will generate Member ID using Member Type Prefix + Serial No
      memberId: this.isEdit ? this.memberForm.memberId : null,

      cardexNo: this.memberForm.cardexNo,
      memberName: this.memberForm.memberName,
      phoneNo: this.memberForm.phoneNo,
      email: this.memberForm.email,
      address: this.memberForm.address,
      parish: this.memberForm.parish,

      // Add mode: required. Edit mode: backend should ignore changing this.
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

    let filtered = this.members.filter((x: any) => {
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
        x.membershipStatus?.toString().toLowerCase().includes(search) ||
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
    return [
      'Admin',
      'Secretary',
      'Treasurer',
      'Internal Auditor',
      'Librarian',
      'Assistant Librarian'
    ].includes(this.userType);
  }

  canAddMember(): boolean {
    return [
      'Admin',
      'Secretary',
      'Treasurer',
      'Librarian',
      'Assistant Librarian'
    ].includes(this.userType);
  }

  canRenewal(): boolean {
    return [
      'Admin',
      'Secretary',
      'Treasurer',
      'Librarian',
      'Assistant Librarian'
    ].includes(this.userType);
  }

  canEdit(): boolean {
    return [
      'Admin',
      'Secretary',
      'Librarian',
      'Assistant Librarian'
    ].includes(this.userType);
  }

  canDelete(): boolean {
    return ['Admin', 'Secretary'].includes(this.userType);
  }


  printMember(member: any): void {

  const memberId = member.memberId || '';
  const memberName = member.memberName || '';
  const cardexNo = member.cardexNo || '';
  const phoneNo = member.phoneNo || '';
  const memberType = member.memberTypeName || '';
  const validTo = this.formatDateOnly(member.expiredOn);
  const renewedOn = this.formatDateOnly(
  member.lastRenewalDate ||
  member.paymentDate ||
  member.createdDate
);

  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Popup blocked');
    return;
  }

  printWindow.document.write(`
  <html>
  <head>
    <title>Member Card</title>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: Arial, sans-serif;
        background: #f3f4f6;
      }

      .print-btn {
        padding: 10px 22px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        margin-bottom: 18px;
        font-size: 15px;
        font-weight: bold;
      }

      .card {
        width: 86mm;
        height: 54mm;
        border-radius: 14px;
        overflow: hidden;
        background: white;
        box-shadow: 0 8px 22px rgba(0,0,0,0.25);
        border: 1px solid #d1d5db;
      }

      .top {
        height: 19mm;
        background: linear-gradient(135deg, #0f172a, #1d4ed8);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        box-sizing: border-box;
      }

      .library {
        font-size: 13px;
        font-weight: 800;
        line-height: 1.2;
      }

      .subtitle {
        font-size: 9px;
        margin-top: 2px;
        opacity: 0.9;
      }

      .logo {
        width: 42px;
        height: 42px;
        object-fit: contain;
        background: white;
        border-radius: 50%;
        padding: 3px;
      }

      .content {
        padding: 8px 12px;
        display: grid;
        grid-template-columns: 34mm 1fr;
        gap: 8px;
        box-sizing: border-box;
      }

      .member-id {
        font-size: 30px;
        font-weight: 900;
        color: #111827;
        margin-bottom: 5px;
      }

      .label {
        font-size: 8px;
        color: #6b7280;
        font-weight: bold;
        text-transform: uppercase;
      }

      .value {
        font-size: 12px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .barcode-box {
        text-align: center;
        padding-top: 3px;
      }

      #barcode {
        width: 100%;
        height: 34px;
      }

      .footer {
        background: #f8fafc;
        border-top: 1px solid #e5e7eb;
        padding: 4px 12px;
        font-size: 8px;
        color: #475569;
        font-weight: bold;
      }

      @media print {
        body {
          background: white;
          padding: 0;
        }

        .print-btn {
          display: none;
        }

        .card {
          box-shadow: none;
        }
      }
    </style>
  </head>

  <body>
    <button class="print-btn" onclick="window.print()">Print Member Card</button>

    <div class="card">
      <div class="top">
        <div>
          <div class="library">St. Thomas OCYM Library, Dubai</div>
          <div class="subtitle">Official Library Membership Card</div>
        </div>

        <img class="logo" src="/images/ocymlogo.png" />
      </div>

      <div class="content">
        <div>
          <div class="label">Member ID</div>
          <div class="member-id">${memberId}</div>

          <div class="label">Name</div>
          <div class="value">${memberName}</div>

          <div class="label">Cardex No</div>
          <div class="value">${cardexNo}</div>
        </div>

        <div class="barcode-box">
          <svg id="barcode"></svg>

          <div class="label">Member Type</div>
          <div class="value">${memberType}</div>

          <div class="label">Renewed On</div>
          <div class="value">${renewedOn}</div>

          <div class="label">Valid Until</div>
          <div class="value">${validTo}</div>
        </div>
      </div>

      <div class="footer">
        This card is property of St. Thomas OCYM Library, Dubai
      </div>
    </div>

    <script>
      JsBarcode("#barcode", "${memberId}", {
        format: "CODE128",
        displayValue: false,
        width: 2,
        height: 34,
        margin: 0
      });
    </script>
  </body>
  </html>
  `);

  printWindow.document.close();
}
}