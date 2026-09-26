import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssignRequest,
  CommentRequest,
  CreateTicketRequest,
  TicketDetailDto,
  TicketQuery,
  TicketSummaryDto,
  UpdateStatusRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class TicketsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/tickets`;

  /** Sorted by dueAt ascending by the API. */
  list(query: TicketQuery = {}, context?: HttpContext): Observable<TicketSummaryDto[]> {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.slaState) params = params.set('slaState', query.slaState);
    if (query.priority) params = params.set('priority', query.priority);
    if (query.mine) params = params.set('mine', 'true');
    return this.http.get<TicketSummaryDto[]>(this.baseUrl, { params, context });
  }

  get(id: number, context?: HttpContext): Observable<TicketDetailDto> {
    return this.http.get<TicketDetailDto>(`${this.baseUrl}/${id}`, { context });
  }

  create(request: CreateTicketRequest): Observable<TicketDetailDto> {
    return this.http.post<TicketDetailDto>(this.baseUrl, request);
  }

  updateStatus(id: number, request: UpdateStatusRequest): Observable<TicketDetailDto> {
    return this.http.patch<TicketDetailDto>(`${this.baseUrl}/${id}/status`, request);
  }

  assign(id: number, request: AssignRequest): Observable<TicketDetailDto> {
    return this.http.patch<TicketDetailDto>(`${this.baseUrl}/${id}/assignee`, request);
  }

  comment(id: number, request: CommentRequest): Observable<TicketDetailDto> {
    return this.http.post<TicketDetailDto>(`${this.baseUrl}/${id}/comments`, request);
  }
}
