import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Priority, SlaPolicyDto, UpdateSlaPolicyRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class SlaPoliciesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/sla-policies`;

  list(context?: HttpContext): Observable<SlaPolicyDto[]> {
    return this.http.get<SlaPolicyDto[]>(this.baseUrl, { context });
  }

  /** MANAGER only. Applies to new tickets only. */
  update(priority: Priority, request: UpdateSlaPolicyRequest): Observable<SlaPolicyDto> {
    return this.http.put<SlaPolicyDto>(`${this.baseUrl}/${priority}`, request);
  }
}
