import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(private api: Api) {}

  changePassword() {

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      alert('Please enter all fields');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const data = {
      username: user.username,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.api.changePassword(data).subscribe({
      next: () => {
        alert('Password changed successfully. Please login again.');

        localStorage.clear();
        window.location.href = '/login';
      },
      error: (err) => {
        console.error(err);

        const message =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || err.message || 'Error while changing password';

        alert(message);
      }
    });
  }
}