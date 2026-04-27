import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import {Router} from '@angular/router';
import {inject} from '@angular/core';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const token = localStorage.getItem("token");

  const isAuthRequest =
    req.url.includes('/authenticate') ||
    req.url.includes('/register');

  let authReq = req;

  if (token && !isAuthRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(error => {

      if (error.status === HttpStatusCode.Unauthorized ||
        error.status === HttpStatusCode.Forbidden) {

        console.warn("Sesión expirada o inválida");

        localStorage.removeItem("token");
        localStorage.removeItem("rol");

        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};
