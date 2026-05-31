import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  summary: any = {
    totalMembers: 0,
    activeMembers: 0,
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    issuedCopies: 0,
    overdueBooks: 0,
    totalPurchases: 0,
    totalPurchaseCost: 0
  };

  years: number[] = [];
  selectedYear: number = new Date().getFullYear();

  constructor(private api: Api) {}

  ngOnInit(): void {
    for (let year = 2026; year <= 2050; year++) {
      this.years.push(year);
    }

    if (this.selectedYear < 2026) {
      this.selectedYear = 2026;
    }

    this.loadDashboard();
  }

  loadDashboard(): void {
  const fromDate = `${this.selectedYear}-01-01`;
  const toDate = `${this.selectedYear}-12-31`;

  this.api.getDashboardSummary(fromDate, toDate).subscribe({
    next: (res: any) => {
      this.summary = {
        totalMembers: res.totalMembers ?? res.TotalMembers ?? 0,
        activeMembers: res.activeMembers ?? res.ActiveMembers ?? 0,
        totalBooks: res.totalBooks ?? res.TotalBooks ?? 0,
        totalCopies: res.totalCopies ?? res.TotalCopies ?? 0,
        availableCopies: res.availableCopies ?? res.AvailableCopies ?? 0,
        issuedCopies: res.issuedCopies ?? res.IssuedCopies ?? 0,
        overdueBooks: res.overdueBooks ?? res.OverdueBooks ?? 0,
        totalPurchases: res.totalPurchases ?? res.TotalPurchases ?? 0,
        totalPurchaseCost: res.totalPurchaseCost ?? res.TotalPurchaseCost ?? 0
      };
    },
    error: (err: any) => {
      console.error('Dashboard Error:', err);
      alert('Error while loading dashboard');
    }
  });
}

  onYearChange(): void {
    this.loadDashboard();
  }
}