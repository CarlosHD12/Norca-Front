import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {AuthService} from '../services/auth-service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    console.log('TOKEN =>', token);
    console.log('URL =>', req.url);

    if (token) {

      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(
        'AUTH HEADER =>',
        req.headers.get('Authorization')
      );
    }

    return next.handle(req).pipe(

      tap({

        next: (event) => {

          if (event instanceof HttpResponse) {

            console.log(
              'RESPONSE OK =>',
              req.url,
              event.status
            );

          }

        },

        error: (error) => {

          console.error(
            'RESPONSE ERROR =>',
            req.url
          );

          console.error(
            'STATUS =>',
            error.status
          );

          console.error(
            'BODY =>',
            error.error
          );

          console.error(error);

        }

      })

    );
  }
}
