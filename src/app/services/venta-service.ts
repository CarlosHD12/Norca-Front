import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Venta} from '../model/Venta';
import {VentaDetalleDTO} from '../model/VentaDetalleDTO';
import {VentasTotalesDTO} from '../model/VentasTotalesDTO';
import {MetodoPagoDTO} from '../model/MetodoPagoDTO';
import {IngresosCategoriaDTO} from '../model/IngresosCategoriaDTO';
import {PageVenta} from '../model/PageVenta';
import {VentaListadoDTO} from '../model/VentaListadoDTO';
import {CrearVentaDTO} from '../model/CrearVentaDTO';
import {ImpactoVentaDTO} from '../model/ImpactoVentaDTO';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  registrarVenta(venta: CrearVentaDTO): Observable<Venta> {
    return this.http.post<Venta>(`${this.baseUrl}/post/venta`, venta);
  }

  editarVenta(id: number, venta: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.baseUrl}/put/venta/${id}`, venta);
  }

  eliminarVenta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/venta/${id}`);
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

  listarVentas(
    page: number = 0,
    size: number = 10,
    filtros?: any
  ): Observable<PageVenta> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros) {

      if (filtros.codigo && filtros.codigo.trim() !== '') {
        params = params.set('codigo', filtros.codigo.trim());
      }

      if (filtros.metodoPago) {
        params = params.set('metodoPago', filtros.metodoPago);
      }

      if (filtros.fecha) {
        const fecha = new Date(filtros.fecha);
        const formatted = fecha.toISOString().split('T')[0];
        params = params.set('fecha', formatted);
      }

      if (filtros.periodo) {
        params = params.set('periodo', filtros.periodo);
      }

      if (filtros.precioMin != null) {
        params = params.set('precioMin', filtros.precioMin.toString());
      }

      if (filtros.precioMax != null) {
        params = params.set('precioMax', filtros.precioMax.toString());
      }

      if (filtros.unidadesMin != null) {
        params = params.set('unidadesMin', filtros.unidadesMin.toString());
      }

      if (filtros.unidadesMax != null) {
        params = params.set('unidadesMax', filtros.unidadesMax.toString());
      }
    }

    return this.http.get<PageVenta>(
      `${this.baseUrl}/listar/ventas`,
      { params }
    );
  }

  impactoVenta(id: number): Observable<ImpactoVentaDTO> {
    return this.http.get<ImpactoVentaDTO>(`${this.baseUrl}/impacto/${id}`);
  }

}
