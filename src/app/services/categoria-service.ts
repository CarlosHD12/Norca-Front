import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CategoriaRegistroDTO} from '../model/CategoriaRegistroDTO';
import {CategoriaResponseDTO} from '../model/CategoriaResponseDTO';
import {CategoriaUpdateDTO} from '../model/CategoriaUpdateDTO';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  constructor() {}

  registrarCategoria(dto: CategoriaRegistroDTO): Observable<CategoriaResponseDTO> {
    return this.http.post<CategoriaResponseDTO>(
      `${this.baseUrl}/crear/categoria`,
      dto
    );
  }

  listarCategorias(): Observable<CategoriaResponseDTO[]> {
    return this.http.get<CategoriaResponseDTO[]>(
      `${this.baseUrl}/listar/categorias`
    );
  }

  editarCategoria(id: number, dto: CategoriaUpdateDTO): Observable<CategoriaResponseDTO> {
    return this.http.put<CategoriaResponseDTO>(
      `${this.baseUrl}/editar/categoria/${id}`,
      dto
    );
  }

  desactivarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/desactivar/categoria/${id}`
    );
  }

  activarCategoria(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/activar/categoria/${id}`,
      {}
    );
  }
}
