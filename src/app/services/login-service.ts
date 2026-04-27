import { inject, Injectable } from '@angular/core';
import { RequestDto } from '../model/request-dto';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, tap, throwError} from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);

  // Base URLs
  private authUrl = `${environment.apiUrl}/authenticate`;
  private apiUrl = environment.apiUrl.replace('/Norca', '/api');

  constructor() {}

  login(requestDto: RequestDto): Observable<any> {

    console.log("🔵 URL:", this.authUrl);
    console.log("🔵 BODY ENVIADO:", requestDto);

    return this.http.post<any>(this.authUrl, requestDto).pipe(

      tap(response => {
        console.log("🟢 RESPUESTA COMPLETA:", response);
      }),

      map(response => {
        if (!response?.jwt) {
          throw new Error('No se recibió token del backend');
        }

        const token = response.jwt;

        console.log("🟢 TOKEN RECIBIDO:", token);

        localStorage.setItem('token', token);

        console.log("🟢 TOKEN GUARDADO EN LOCALSTORAGE");

        return response;
      }),

      catchError((error: HttpErrorResponse) => {
        console.error("🔴 ERROR LOGIN:", error);

        if (error.status === 403) {
          console.error("⛔ Forbidden → problema de Spring Security / JWT filter");
        } else if (error.status === 401) {
          console.error("⛔ Credenciales incorrectas");
        } else if (error.status === 0) {
          console.error("⛔ No hay conexión con el backend");
        }

        return throwError(() => error);
      })
    );
  }

  crearUsuario(usuario: any): Observable<any> {
    console.log("🔵 CREAR USUARIO:", usuario);

    return this.http.post(`${this.apiUrl}/user`, usuario).pipe(
      catchError(this.handleError)
    );
  }

  asignarRol(userId: number, rolId: number): Observable<any> {
    console.log("🔵 ASIGNAR ROL:", userId, rolId);

    return this.http.post(`${this.apiUrl}/save/${userId}/${rolId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log("🟡 TOKEN ACTUAL:", token);
    return token;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error("🔴 ERROR API:", error);
    return throwError(() => error);
  }
}
