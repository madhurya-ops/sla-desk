import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ProblemDetail } from '../models';

/** Shows ProblemDetail.detail (or a sensible fallback) in a snackbar for every failed request. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        snackBar.open(errorMessage(error), 'Dismiss', { duration: 6000 });
      }
      return throwError(() => error);
    }),
  );
};

function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Cannot reach the server. Is the backend running?';
  }
  const body = error.error as Partial<ProblemDetail> | null;
  if (body && typeof body === 'object' && body.detail) {
    return body.detail;
  }
  if (error.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  return body?.title ?? `Request failed (${error.status})`;
}
