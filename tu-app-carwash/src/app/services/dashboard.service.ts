import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminDashboardStats {
  today_wash_count: number;
  today_income: number;
  active_employees?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<AdminDashboardStats> {
    return this.api.get<AdminDashboardStats>('/admin/dashboard-stats');
  }
}
