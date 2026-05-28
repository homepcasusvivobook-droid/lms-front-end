import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {

  private timeout: any;
  private readonly timeoutMinutes = 30;

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  startWatching(): void {
    this.resetTimer();

    ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }

  resetTimer(): void {
    clearTimeout(this.timeout);

    this.ngZone.runOutsideAngular(() => {
      this.timeout = setTimeout(() => {
        this.ngZone.run(() => {
          this.logout();
        });
      }, this.timeoutMinutes * 60 * 1000);
    });
  }

  logout(): void {
  localStorage.removeItem('user');

  if (this.router.url !== '/login') {
    alert('Session expired due to inactivity. Please login again.');
  }

  this.router.navigate(['/login']);
}
}