import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {

  currentUser: any;
  userTypeName = '';
  isCollapsed = false;

  @Output() collapsedChange = new EventEmitter<boolean>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');

    if (user) {
      this.currentUser = JSON.parse(user);
      this.userTypeName =
        this.currentUser.userTypeName ||
        this.currentUser.userType ||
        '';
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  canAccess(roles: string[]): boolean {
    return roles.includes(this.userTypeName);
  }

  canShowUsers(): boolean {
    return this.canAccess(['Admin', 'Secretary']);
  }

  logout(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('username');
  localStorage.removeItem('userName');
  localStorage.removeItem('userType');
  localStorage.removeItem('token');

  this.router.navigateByUrl('/login', { replaceUrl: true });
}
}