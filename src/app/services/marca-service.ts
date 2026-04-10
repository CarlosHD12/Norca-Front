import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Marca} from '../model/Marca';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  crearMarca(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(`${this.baseUrl}/post/marca`, marca);
  }

  listarMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.baseUrl}/get/marca`);
  }

  actualizarMarca(id: number, marca: Marca): Observable<Marca> {
    return this.http.put<Marca>(`${this.baseUrl}/put/marca/${id}`, marca);
  }

  eliminarMarca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/marca/${id}`);
  }
}
