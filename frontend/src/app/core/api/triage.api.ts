import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TriageRequest, TriageResult } from '../models';

@Injectable({ providedIn: 'root' })
export class TriageApi {
  private readonly http = inject(HttpClient);

  preview(request: TriageRequest): Observable<TriageResult> {
    return this.http.post<TriageResult>(`${environment.apiUrl}/api/triage/preview`, request);
  }
}
