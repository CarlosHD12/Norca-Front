import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Marca} from '../model/Marca';
import {MarcaRegistroDTO} from '../model/MarcaRegistroDTO';
import {MarcaResponseDTO} from '../model/MarcaResponseDTO';
import {MarcaUpdateDTO} from '../model/MarcaUpdateDTO';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  constructor() {}

  registrarMarca(dto: MarcaRegistroDTO): Observable<MarcaResponseDTO> {
    return this.http.post<MarcaResponseDTO>(
      `${this.baseUrl}/crear/marca`,
      dto
    );
  }

  listarMarcas(): Observable<MarcaResponseDTO[]> {
    return this.http.get<MarcaResponseDTO[]>(
      `${this.baseUrl}/listar/marcas`
    );
  }

  editarMarca(id: number, dto: MarcaUpdateDTO): Observable<MarcaResponseDTO> {
    return this.http.put<MarcaResponseDTO>(
      `${this.baseUrl}/editar/marca/${id}`,
      dto
    );
  }

  desactivarMarca(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/desactivar/marca/${id}`
    );
  }

  activarMarca(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/activar/marca/${id}`,
      {}
    );
  }
}
