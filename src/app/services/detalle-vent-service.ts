import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {DetalleVent} from '../model/detalle-vent';

@Injectable({
  providedIn: 'root'
})
export class DetalleVentService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<DetalleVent[]>();

  constructor() { }
  setList(listaNueva: DetalleVent[]) {
    this.listaCambio.next(listaNueva);
  }
  getListaCambio(): Observable<DetalleVent[]>{
    return this.listaCambio.asObservable();
  }

  // -------------------- GUARDAR --------------------
  insert(detalle: any): Observable<any> {
    return this.http.post(`${this.url}/dv`, detalle);
  }

  // -------------------- LISTAR TODAS --------------------
  list(): Observable<DetalleVent[]> {
    return this.http.get<DetalleVent[]>(this.url + '/dvs');
  }

  // -------------------- LISTAR POR PRENDA --------------------
  listarPorPrenda(idPrenda: number): Observable<DetalleVent[]> {
    return this.http.get<DetalleVent[]>(`${this.url}/prenda/${idPrenda}`);
  }

  // Eliminar detalle
  eliminar(idDetalle: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/dv/eliminar/${idDetalle}`);
  }

  // Actualizar detalle
  actualizar(idDetalle: number, dto: any): Observable<DetalleVent> {
    return this.http.put<DetalleVent>(`${this.url}/dv/modificar/${idDetalle}`, dto);
  }

  // Contar detalles por venta
  contarDetallesPorVenta(idVenta: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/dv/${idVenta}/count`);
  }

  // -------------------- LISTAR POR VENTA --------------------
  listarPorVenta(idVenta: number): Observable<DetalleVent[]> {
    return this.http.get<DetalleVent[]>(`${this.url}/dv/venta/${idVenta}`);
  }
  // 🧮 Total de unidades vendidas
  getTotalVendido(idPrenda: number): Observable<number> {
    return this.http.get<number>(`${this.url}/prenda/${idPrenda}/total-vendido`);
  }

  // 💵 Ingresos totales generados
  getIngresosTotales(idPrenda: number): Observable<number> {
    return this.http.get<number>(`${this.url}/prenda/${idPrenda}/ingresos`);
  }

  // 🛒 Cantidad de ventas realizadas
  getCantidadVentas(idPrenda: number): Observable<number> {
    return this.http.get<number>(`${this.url}/prenda/${idPrenda}/ventas`);
  }

  // 🗓️ Última fecha de venta
  getUltimaVenta(idPrenda: number): Observable<string> {
    return this.http.get<string>(`${this.url}/prenda/${idPrenda}/ultima-venta`);
  }

  // 📊 Ranking de prendas más vendidas
  getRankingPrendas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ranking`);
  }

  // ⏳ Tiempo promedio en venderse (en días)
  getTiempoPromedioVenta(idPrenda: number): Observable<number> {
    return this.http.get<number>(`${this.url}/prenda/${idPrenda}/tiempo-promedio`);
  }


}
