import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummaryDto } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);

  summary(context?: HttpContext): Observable<DashboardSummaryDto> {
    return this.http.get<DashboardSummaryDto>(`${environment.apiUrl}/api/dashboard/summary`, {
      context,
    });
  }
}
