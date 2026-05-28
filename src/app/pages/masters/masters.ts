import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-masters',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './masters.html',
  styleUrl: './masters.css'
})
export class Masters {

  userType = localStorage.getItem('userType') || localStorage.getItem('role') || '';

  allowedMasterRoles = [
    'Admin',
    'Secretary',
    'Treasurer',
    'Internal Auditor',
    'Librarian',
    'Assistant Librarian'
  ];

  canShowMasterTile(): boolean {
    return this.allowedMasterRoles
      .map(x => x.toLowerCase())
      .includes(this.userType.toLowerCase());
  }

  canShowUsersTile(): boolean {
    return ['admin', 'secretary']
      .includes(this.userType.toLowerCase());
  }
}