import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Venta} from '../model/venta';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<Venta[]>();

  constructor() { }

  setList(listaNueva: Venta[]) {
    this.listaCambio.next(listaNueva);
  }

  // -------------------- GUARDAR --------------------
  insert(venta: Partial<Venta>): Observable<any> {
    return this.http.post(this.url + '/venta', venta);
  }

  // -------------------- LISTAR TODAS --------------------
  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.url + '/ventas');
  }

  // -------------------- EDITAR --------------------
  actualizar(id: number, venta: Venta | null): Observable<any> {
    return this.http.put(this.url + '/venta/modificar/' + id, venta);
  }

  // -------------------- LISTAR POR METODO DE PAGO --------------------
  listarPorMetodoPago(metodoPago: string): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.url + '/ventas/metodo/' + metodoPago);
  }

  // -------------------- LISTAR POR FECHA --------------------
  listarPorFecha(fecha: string): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.url + '/ventas/fecha/' + fecha);
  }

  // -------------------- LISTAR POR RANGO DE FECHAS --------------------
  listarPorRangoFechas(inicio: string, fin: string): Observable<Venta[]> {
    let params = new HttpParams().set('inicio', inicio).set('fin', fin);
    return this.http.get<Venta[]>(this.url + '/ventas/rango', { params });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/venta/eliminar/${id}`, { responseType: 'text' });
  }
}
