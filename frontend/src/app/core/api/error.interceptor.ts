import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ProblemDetail } from '../models';

/**
 * Set on background polls: the page shows its own inline error state, so a snackbar every few
 * seconds while the server is down would just be noise.
 */
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

export function silentErrors(): HttpContext {
  return new HttpContext().set(SILENT_ERRORS, true);
}

/** Shows ProblemDetail.detail (or a sensible fallback) in a snackbar for every failed request. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !req.context.get(SILENT_ERRORS)) {
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
