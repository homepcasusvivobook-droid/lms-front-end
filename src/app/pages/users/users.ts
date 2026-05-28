import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: any[] = [];
  userTypes: any[] = [];

  searchText = '';

  userType: string = '';
  canDeleteUser: boolean = false;

  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  showCreate = false;
  showView = false;
  showEdit = false;

  showResetPassword = false;
  resetUser: any = null;
  newPassword = '';
  confirmPassword = '';

  selectedUser: any = null;

  id = 0;
  fullName = '';
  username = '';
  password = '';
  userTypeId = 0;
  validityFrom = '';
  validityTo = '';

  constructor(private api: Api) {}

  ngOnInit(): void 
  {

    this.userType = localStorage.getItem('userType') || '';
    this.canDeleteUser = this.userType === 'Admin';
    this.loadUsers();
    this.loadUserTypes();
  }

  loadUsers() {
    this.api.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadUserTypes() {
    this.api.getUserTypes().subscribe({
      next: (data) => {
        this.userTypes = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  addUser() {
    this.clearForm();
    this.showCreate = true;
  }

  closeCreate() {
    this.showCreate = false;
  }

  closeEdit() {
    this.showEdit = false;
  }

  closeView() {
    this.showView = false;
  }

  saveUser() {

  const data = {
    fullName: this.fullName,
    username: this.username,
    password: this.password,
    userTypeId: Number(this.userTypeId),
    validityFrom: this.validityFrom,
    validityTo: this.validityTo,
    createdBy: 'Admin'
  };

  this.api.createUser(data).subscribe({
    next: () => {

      alert('User created successfully');

      this.loadUsers();
      this.clearForm();

      this.showCreate = false;
    },
    error: (err: any) => {
      console.error(err);

      const message =
        typeof err.error === 'string'
          ? err.error
          : err.error?.message ||
            err.message ||
            'Error while saving user';

      alert(message);
    }
  });
}

  editUser(user: any) {

    this.id = user.id;
    this.fullName = user.fullName;
    this.username = user.username;
    this.password = '';
    this.userTypeId = user.userTypeId;

    this.validityFrom = this.formatDate(user.validityFrom);
    this.validityTo = this.formatDate(user.validityTo);

    this.showEdit = true;
  }

  updateUser() {

    const data = {
      fullName: this.fullName,
      username: this.username,
      password: this.password,
      userTypeId: Number(this.userTypeId),
      validityFrom: this.validityFrom,
      validityTo: this.validityTo,
      editedBy: 'Admin'
    };

    this.api.updateUser(this.id, data).subscribe({
      next: () => {

        alert('User updated successfully');

        this.loadUsers();

        this.showEdit = false;

        this.clearForm();
      },
      error: (err) => {
         console.error(err);
         const message =
         typeof err.error === 'string'
         ? err.error
         : err.error?.message || err.message || 'Error while updating user';
         alert(message);
        }
    });
  }

  deleteUser(user: any) {

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  if (
    currentUser.id === user.id ||
    currentUser.Id === user.id
  ) {

    alert('You cannot delete your own logged-in account.');
    return;
  }

  if (!confirm('Are you sure want to delete this user?')) {
    return;
  }

  this.api.deleteUser(user.id, currentUser.username).subscribe({

    next: () => {

      alert('User deleted successfully');

      this.loadUsers();
    },

    error: (err) => {

      console.error(err);

      const message =
        typeof err.error === 'string'
          ? err.error
          : err.error?.message ||
            err.message ||
            'Error while deleting user';

      alert(message);
    }
  });
}

  viewUser(user: any) {

    this.selectedUser = user;

    this.showView = true;
  }

  clearForm() {

    this.id = 0;

    this.fullName = '';
    this.username = '';
    this.password = '';
    this.userTypeId = 0;

    this.validityFrom = '';
    this.validityTo = '';
  }

  sortData(column: string) {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';

    } else {

      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get filteredUsers() {

    const search = this.searchText.toLowerCase();

    let filtered = this.users.filter(x =>

      x.fullName?.toLowerCase().includes(search) ||

      x.username?.toLowerCase().includes(search) ||

      x.password?.toLowerCase().includes(search) ||

      x.userTypeName?.toLowerCase().includes(search) ||

      x.validityFrom?.toString().toLowerCase().includes(search) ||

      x.validityTo?.toString().toLowerCase().includes(search)
    );

    filtered.sort((a: any, b: any) => {

      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];

      if (valueA == null) valueA = '';
      if (valueB == null) valueB = '';

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }

      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return filtered;
  }

  formatDate(date: any): string {

    if (!date) return '';

    const d = new Date(date);

    return d.toISOString().split('T')[0];
  }
  openResetPassword(user: any) {

  this.resetUser = user;

  this.newPassword = '';

  this.confirmPassword = '';

  this.showResetPassword = true;
}

closeResetPassword() {

  this.showResetPassword = false;

  this.resetUser = null;

  this.newPassword = '';

  this.confirmPassword = '';
}

resetPassword() {

  if (!this.newPassword || !this.confirmPassword) {

    alert('Please enter password and confirm password');

    return;
  }

  if (this.newPassword !== this.confirmPassword) {

    alert('Password and confirm password do not match');

    return;
  }

  this.api.resetPassword(
    this.resetUser.id,
    this.newPassword
  ).subscribe({

    next: () => {

      alert('Password reset successfully');

      this.closeResetPassword();
    },

    error: (err: any) => {

      console.error(err);

      const message =
        typeof err.error === 'string'
          ? err.error
          : err.error?.message ||
            err.message ||
            'Error while resetting password';

      alert(message);
    }
  });
}
}