import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Talla} from '../model/Talla';
import {Observable} from 'rxjs';
import {TallaRegistroDTO} from '../model/TallaRegistroDTO';
import {TallaResponseDTO} from '../model/TallaResponseDTO';
import {TallaUpdateDTO} from '../model/TallaUpdateDTO';

@Injectable({
  providedIn: 'root'
})
export class TallaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  constructor() {}

  registrarTalla(dto: TallaRegistroDTO): Observable<TallaResponseDTO> {
    return this.http.post<TallaResponseDTO>(
      `${this.baseUrl}/crear/talla`,
      dto
    );
  }

  listarTallas(): Observable<TallaResponseDTO[]> {
    return this.http.get<TallaResponseDTO[]>(
      `${this.baseUrl}/listar/tallas`
    );
  }

  editarTalla(id: number, dto: TallaUpdateDTO): Observable<TallaResponseDTO> {
    return this.http.put<TallaResponseDTO>(
      `${this.baseUrl}/editar/talla/${id}`,
      dto
    );
  }

  desactivarTalla(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/desactivar/talla/${id}`
    );
  }

  activarTalla(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/activar/talla/${id}`,
      {}
    );
  }
}
