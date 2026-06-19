import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LoteMetricasDTO} from '../model/LoteMetricasDTO';
import {LoteDetalleDTO} from '../model/LoteDetalleDTO';
import {UltimoLoteResponseDTO} from '../model/UltimoLoteResponseDTO';
import {LoteSeleccionadoDTO} from '../model/LoteSeleccionadoDTO';
import {MetricaLoteDTO} from '../model/MetricaLoteDTO';
import {LoteRegistroDTO} from '../model/LoteRegistroDTO';
import {LoteResponseDTO} from '../model/LoteResponseDTO';
import {HistorialPrendaResponseDTO} from '../model/HistorialPrendaResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  constructor() {}

  registrarLote(dto: LoteRegistroDTO): Observable<LoteResponseDTO> {
    return this.http.post<LoteResponseDTO>(
      `${this.baseUrl}/crear/lote`,
      dto
    );
  }

  obtenerMetricasLote(id: number): Observable<MetricaLoteDTO> {
    return this.http.get<MetricaLoteDTO>(
      `${this.baseUrl}/metricas/lote/${id}`
    );
  }

  obtenerInventariosDisponibles(idPrenda: number): Observable<LoteSeleccionadoDTO> {
    return this.http.get<LoteSeleccionadoDTO>(
      `${this.baseUrl}/inventarios/loteFIFO/${idPrenda}`
    );
  }

  listarHistorialLotes(idPrenda: number): Observable<HistorialPrendaResponseDTO> {
    return this.http.get<HistorialPrendaResponseDTO>(
      `${this.baseUrl}/historial/lote/${idPrenda}`
    );
  }

  obtenerUltimoLotePrenda(idPrenda: number): Observable<UltimoLoteResponseDTO> {
    return this.http.get<UltimoLoteResponseDTO>(
      `${this.baseUrl}/ultimo/lote/${idPrenda}`
    );
  }


  getMetricas(id: number): Observable<LoteMetricasDTO> {
    return this.http.get<LoteMetricasDTO>(`${this.baseUrl}/metricas/lote/${id}`);
  }

  historialLotes(idPrenda: number): Observable<LoteDetalleDTO[]> {
    return this.http.get<LoteDetalleDTO[]>(`${this.baseUrl}/historial/lote/${idPrenda}`);
  }
}
