import {HttpInterceptorFn, HttpStatusCode} from '@angular/common/http';
import {catchError, EMPTY, throwError} from 'rxjs';

export const loginInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("Interceptor!");
  const token = localStorage.getItem("token");
  console.log("Token recuperado:", token);

  let authReq = req;

  // 🚫 No agregues token si la URL es /authenticate
  if (token && !req.url.includes('/authenticate')) {
    console.log("Hay token! Clonando solicitud...");
    authReq = req.clone({
      withCredentials: true,
      headers: req.headers.set(
        'Authorization',
        `Bearer ${token}`
      )
    });
    console.log("Solicitud clonada con token");
  } else {
    console.log("No se agregó token (ruta pública o sin token)");
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === HttpStatusCode.Forbidden) {
        alert("NO TIENES PERMISOS!");
        return EMPTY;
      } else {
        return throwError(() => error);
      }
    })
  );
};

