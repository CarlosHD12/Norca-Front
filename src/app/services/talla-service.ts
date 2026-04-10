import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Talla} from '../model/Talla';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TallaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  crearTalla(talla: Talla): Observable<Talla> {
    return this.http.post<Talla>(`${this.baseUrl}/post/talla`, talla);
  }

  listarTallas(): Observable<Talla[]> {
    return this.http.get<Talla[]>(`${this.baseUrl}/get/talla`);
  }

  actualizarTalla(id: number, talla: Talla): Observable<Talla> {
    return this.http.put<Talla>(`${this.baseUrl}/put/talla/${id}`, talla);
  }

  eliminarTalla(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/talla/${id}`);
  }
}
