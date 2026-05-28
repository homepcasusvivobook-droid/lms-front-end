import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  summary: any = {};

  constructor(private api: Api) { }

  ngOnInit(): void {
    this.api.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: (err) => {
        console.error('Dashboard API error', err);
      }
    });
  }
}
