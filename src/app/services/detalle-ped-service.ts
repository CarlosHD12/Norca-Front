import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {DetallePed} from '../model/detalle-ped';

@Injectable({
  providedIn: 'root'
})
export class DetallePedService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<DetallePed[]>();

  constructor() { }
  setList(listaNueva: DetallePed[]) {
    this.listaCambio.next(listaNueva);
  }
  getListaCambio(): Observable<DetallePed[]>{
    return this.listaCambio.asObservable();
  }

  // -------------------- GUARDAR --------------------
  insert(detallePed: DetallePed): Observable<any> {
    return this.http.post(this.url + '/dp', detallePed);
  }

  // -------------------- ACTUALIZAR --------------------
  update(id: number, detallePed: DetallePed): Observable<any> {
    return this.http.put(`${this.url}/dp/modificar/${id}`, detallePed);
  }

  // -------------------- LISTAR TODAS --------------------
  list(): Observable<DetallePed[]> {
    return this.http.get<DetallePed[]>(this.url + '/dps');
  }

  // -------------------- LISTAR POR PEDIDO --------------------
  listarPorPedido(idPedido: number): Observable<DetallePed[]> {
    return this.http.get<DetallePed[]>(this.url + '/dp/pedido/' + idPedido);
  }

  // -------------------- CONTAR PRENDAS POR PEDIDO --------------------
  contarPrendasPedido(idPedido: number): Observable<number> {
    return this.http.get<number>(`${this.url}/dp/pedido/${idPedido}/count`);
  }

  // -------------------- ELIMINAR --------------------
  eliminar(idDetalle: number): Observable<any> {
    return this.http.delete(`${this.url}/dp/eliminar/${idDetalle}`);
  }
}
