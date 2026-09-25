import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const LOGIN_PATH = '/api/auth/login';

/** Adds the bearer token to API calls; on any 401 clears the session and goes to /login. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApiCall = req.url.startsWith(environment.apiUrl);
  const token = auth.token;
  const authReq =
    isApiCall && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && isApiCall) {
        auth.clearSession();
        if (!req.url.endsWith(LOGIN_PATH)) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
