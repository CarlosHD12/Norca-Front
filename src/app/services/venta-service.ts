import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VentaDetalleDTO} from '../model/VentaDetalleDTO';
import {VentasTotalesDTO} from '../model/VentasTotalesDTO';
import {MetodoPagoDTO} from '../model/MetodoPagoDTO';
import {IngresosCategoriaDTO} from '../model/IngresosCategoriaDTO';
import {ImpactoVentaDTO} from '../model/ImpactoVentaDTO';
import {VentaRegistroDTO} from '../model/VentaRegistroDTO';
import {VentaResponseDTO} from '../model/VentaResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  constructor() {}

  registrarVenta(dto: VentaRegistroDTO): Observable<VentaResponseDTO> {
    return this.http.post<VentaResponseDTO>(
      `${this.baseUrl}/crear/venta`,
      dto
    );
  }

  anularVenta(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/anular/venta/${id}`,
      {}
    );
  }

  listarVentas(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<any>(
      `${this.baseUrl}/listar/ventas`,
      { params }
    );
  }






  obtenerDetalleVenta(idVenta: number): Observable<VentaDetalleDTO> {
    return this.http.get<VentaDetalleDTO>(`${this.baseUrl}/detalle/venta/${idVenta}`);
  }

  desactivarVenta(idVenta: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/desactivar/venta/${idVenta}`, null, { responseType: 'text' });
  }

  kpiVentas(): Observable<VentasTotalesDTO> {
    return this.http.get<VentasTotalesDTO>(`${this.baseUrl}/ventas/totales`);
  }

  kpiUnidades(): Observable<VentasTotalesDTO> {
    return this.http.get<VentasTotalesDTO>(`${this.baseUrl}/unidades/totales`);
  }

  obtenerIngresosTotales(): Observable<VentasTotalesDTO> {
    return this.http.get<VentasTotalesDTO>(`${this.baseUrl}/ingresos/totales`);
  }

  obtenerMetodoPagoFavorito(): Observable<MetodoPagoDTO> {
    return this.http.get<MetodoPagoDTO>(`${this.baseUrl}/metodo/top`);
  }

  obtenerIngresosPorCategoria(): Observable<IngresosCategoriaDTO[]> {
    return this.http.get<IngresosCategoriaDTO[]>(`${this.baseUrl}/ganancias/categoria`);
  }

  reporteMensual(tipo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ventas/mensuales`, { params: { tipo } });
  }

  impactoVenta(id: number): Observable<ImpactoVentaDTO> {
    return this.http.get<ImpactoVentaDTO>(`${this.baseUrl}/impacto/${id}`);
  }
}
