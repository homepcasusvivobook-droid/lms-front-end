import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Sidebar } from './shared/sidebar/sidebar';
import { SessionTimeoutService } from './services/session-timeout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  isSidebarCollapsed = false;

  constructor(
    private router: Router,
    private sessionTimeout: SessionTimeoutService
  ) {}

  ngOnInit(): void {
    this.sessionTimeout.startWatching();
  }

  @HostListener('window:popstate')
  onPopState() {
    const user = localStorage.getItem('user');

    if (!user) {
      this.router.navigate(['/login']);
    }
  }

  onSidebarCollapsed(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  isLoginPage() {
    return this.router.url === '/login';
  }
}