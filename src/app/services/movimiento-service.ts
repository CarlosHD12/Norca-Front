import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

import { MovimientoRegistroDTO } from '../model/MovimientoRegistroDTO';
import { MovimientoResponseDTO } from '../model/MovimientoResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  constructor() {}

  registrarMovimiento(dto: MovimientoRegistroDTO): Observable<MovimientoResponseDTO> {
    return this.http.post<MovimientoResponseDTO>(
      `${this.baseUrl}/movimiento`,
      dto
    );
  }
}
