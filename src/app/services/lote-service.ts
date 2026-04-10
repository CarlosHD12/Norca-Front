import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Lote} from '../model/Lote';
import {Observable} from 'rxjs';
import {LoteMetricasDTO} from '../model/LoteMetricasDTO';
import {Prenda} from '../model/Prenda';
import {LotesTotalesDTO} from '../model/LotesTotalesDTO';
import {LoteMensualDTO} from '../model/LoteMensualDTO';
import {LoteDetalleDTO} from '../model/LoteDetalleDTO';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  registrarLote(lote: Lote): Observable<Lote> {
    return this.http.post<Lote>(`${this.baseUrl}/post/lote`, lote);
  }

  listarLotes(): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.baseUrl}/get/lote`);
  }

  editarLote(id: number, lote: Lote): Observable<Lote> {
    return this.http.put<Lote>(`${this.baseUrl}/put/lote/${id}`, lote);
  }

  eliminarLote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/lote/${id}`);
  }

  getMetricas(id: number): Observable<LoteMetricasDTO> {
    return this.http.get<LoteMetricasDTO>(`${this.baseUrl}/metricas/lote/${id}`);
  }

  historialLotes(idPrenda: number): Observable<LoteDetalleDTO[]> {
    return this.http.get<LoteDetalleDTO[]>(`${this.baseUrl}/historial/lote/${idPrenda}`);
  }

  obtenerStockDisponible(): Observable<LotesTotalesDTO> {
    return this.http.get<LotesTotalesDTO>(`${this.baseUrl}/stock/total`);
  }

  obtenerLotesActivos(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/lote/activos`);
  }

  obtenerLotesPorMes(): Observable<LoteMensualDTO[]> {
    return this.http.get<LoteMensualDTO[]>(`${this.baseUrl}/lote/mensual`);
  }
}
