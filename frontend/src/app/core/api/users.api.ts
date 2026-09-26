import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, UserDto } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);

  /** LEAD and MANAGER only. */
  list(role: Role): Observable<UserDto[]> {
    const params = new HttpParams().set('role', role);
    return this.http.get<UserDto[]>(`${environment.apiUrl}/api/users`, { params });
  }
}
