import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
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
import {PrendaRegistroDTO} from '../model/PrendaRegistroDTO';
import {PrendaResponseDTO} from '../model/PrendaResponseDTO';
import {PrendaUpdateDTO} from '../model/PrendaUpdateDTO';
import {PageResponse} from '../model/PageResponse';
import {PrendaListResponseDTO} from '../model/PrendaListResponseDTO';
import {PrendaFiltros} from '../model/PrendaFiltros';
import {PrendaKpiResponse} from '../model/PrendaKpiResponse';
import {PrendaQuickDetailDTO} from '../model/PrendaQuickDetalleDTO';

@Injectable({
  providedIn: 'root'
})
export class PrendaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  constructor() {}

  registrarPrenda(dto: PrendaRegistroDTO): Observable<PrendaResponseDTO> {
    return this.http.post<PrendaResponseDTO>(
      `${this.baseUrl}/crear/prenda`,
      dto
    );
  }

  actualizarPrenda(id: number, dto: PrendaUpdateDTO): Observable<PrendaResponseDTO> {
    return this.http.put<PrendaResponseDTO>(
      `${this.baseUrl}/editar/prenda/${id}`,
      dto
    );
  }

  inhabilitarPrenda(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/inhabilitar/prenda/${id}`,
      {}
    );
  }

  obtenerDetallePrenda(id: number): Observable<PrendaDetalleDTO> {
    return this.http.get<PrendaDetalleDTO>(
      `${this.baseUrl}/detalle/prenda/${id}`
    );
  }

  listarPrendas(page: number = 0, size: number = 20): Observable<PageResponse<PrendaListResponseDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<PrendaListResponseDTO>>(
      `${this.baseUrl}/listar/prendas`,
      { params }
    );
  }

  activarPrenda(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/activar/prenda/${id}`,
      {}
    );
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

  listarPrendasFiltradas(filtros: PrendaFiltros): Observable<PageResponse<PrendaListResponseDTO>> {
    let params = new HttpParams();
    if (filtros.search) {
      params = params.set(
        'search',
        filtros.search
      );
    }
    if (filtros.categoria) {
      params = params.set(
        'categoria',
        filtros.categoria
      );
    }
    if (filtros.marca) {
      params = params.set(
        'marca',
        filtros.marca
      );
    }
    if (filtros.estado) {
      params = params.set(
        'estado',
        filtros.estado
      );
    }
    if (
      filtros.stockMin !== null &&
      filtros.stockMin !== undefined
    ) {
      params = params.set(
        'stockMin',
        filtros.stockMin
      );
    }
    if (
      filtros.stockMax !== null &&
      filtros.stockMax !== undefined
    ) {
      params = params.set(
        'stockMax',
        filtros.stockMax
      );
    }
    if (
      filtros.precioMin !== null &&
      filtros.precioMin !== undefined
    ) {
      params = params.set(
        'precioMin',
        filtros.precioMin
      );
    }
    if (
      filtros.precioMax !== null &&
      filtros.precioMax !== undefined
    ) {
      params = params.set(
        'precioMax',
        filtros.precioMax
      );
    }
    params = params.set(
      'page',
      filtros.page ?? 0
    );
    params = params.set(
      'size',
      filtros.size ?? 20
    );
    return this.http.get<
      PageResponse<PrendaListResponseDTO>
    >(
      `${this.baseUrl}/listar/prendas`,
      { params }
    );
  }

  obtenerKpis(): Observable<PrendaKpiResponse> {
    return this.http.get<PrendaKpiResponse>(
      `${this.baseUrl}/kpis/prendas`
    );
  }

  getQuickDetail(idPrenda: number): Observable<PrendaQuickDetailDTO> {
    return this.http.get<PrendaQuickDetailDTO>(
      `${this.baseUrl}/detalle/rapido/${idPrenda}`
    );
  }
}
