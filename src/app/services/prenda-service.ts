import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Prenda} from '../model/Prenda';
import {PrendaDetalleDTO} from '../model/PrendaDetalleDTO';
import {PrendaCarritoDTO} from '../model/PrendaCarritoDTO';
import {InventarioActivoDTO} from '../model/InventarioActivoDTO';
import {PrendaOlvidadaDTO} from '../model/PrendaOlvidadaDTO';
import {TopDTO} from '../model/TopDTO';
import {StockBajoDTO} from '../model/StockBajoDTO';
import {PrendasTotalesDTO} from '../model/PrendasTotalesDTO';
import {StockCategoriaDTO} from '../model/StockCategoriaDTO';
import {PrendaListadoDTO} from '../model/PrendaListadoDTO';

@Injectable({
  providedIn: 'root'
})
export class PrendaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  registrarPrenda(prenda: Prenda): Observable<Prenda> {
    return this.http.post<Prenda>(`${this.baseUrl}/post/prenda`, prenda);
  }

  editarPrenda(id: number, prenda: Prenda): Observable<Prenda> {
    return this.http.put<Prenda>(`${this.baseUrl}/put/prenda/${id}`, prenda);
  }

  eliminarPrenda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/prenda/${id}`);
  }

  listarPrendasTabla(): Observable<PrendaListadoDTO[]> {
    return this.http.get<PrendaListadoDTO[]>(`${this.baseUrl}/listar/prendas`);
  }

  obtenerDetalle(id: number): Observable<PrendaDetalleDTO> {
    return this.http.get<PrendaDetalleDTO>(`${this.baseUrl}/detalle/prenda/${id}`);
  }

  cambiarEstado(idPrenda: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/cambiar/estado/${idPrenda}`, null, { responseType: 'text' });
  }

  activarEstado(id: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/activar/prenda/${id}`, null, { responseType: 'text' });
  }

  listarPrendasDisponibles(): Observable<PrendaCarritoDTO[]> {
    return this.http.get<PrendaCarritoDTO[]>(`${this.baseUrl}/listar/prenda/disponibles`);
  }

  obtenerInventario(idPrenda: number): Observable<InventarioActivoDTO[]> {
    return this.http.get<InventarioActivoDTO[]>(`${this.baseUrl}/inventario/prenda/${idPrenda}`);
  }

  getDistribucionPorCategoria(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/distribucion/categoria`);
  }

  getDistribucionPorMarca(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/distribucion/marca`);
  }

  getDistribucionPorEstado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/distribucion/estado`);
  }

  obtenerPrendasOlvidadas(): Observable<PrendaOlvidadaDTO[]> {
    return this.http.get<PrendaOlvidadaDTO[]>(`${this.baseUrl}/prenda/olvidada`);
  }

  rankingMasVendidas(): Observable<TopDTO[]> {
    return this.http.get<TopDTO[]>(`${this.baseUrl}/prenda/ranking`);
  }

  obtenerPrendasBajoStock(limite: number = 10): Observable<StockBajoDTO[]> {
    return this.http.get<StockBajoDTO[]>(`${this.baseUrl}/prenda/stock-bajo`, { params: { limite } });
  }

  obtenerKPIPrendas(): Observable<PrendasTotalesDTO> {
    return this.http.get<PrendasTotalesDTO>(`${this.baseUrl}/prendas/totales`);
  }

  obtenerPrendasAgotadas(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/prenda/agotada`);
  }

  stockPorCategoria(): Observable<StockCategoriaDTO[]> {
    return this.http.get<StockCategoriaDTO[]>(`${this.baseUrl}/stock/categoria`);
  }

  obtenerPrendas(): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(`${this.baseUrl}/get/prendas`);
  }
}
