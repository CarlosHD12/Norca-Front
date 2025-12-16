import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Pedido} from '../model/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<Pedido[]>();

  constructor() { }
  // -------------------- GUARDAR --------------------
  insert(pedido: Pedido): Observable<any> {
    return this.http.post(this.url + '/pedido', pedido);
  }

  // -------------------- LISTAR TODAS --------------------
  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.url + '/pedidos');
  }

  // -------------------- EDITAR --------------------
  actualizar(id: number, pedido: Pedido): Observable<any> {
    return this.http.put(this.url + '/pedido/modificar/' + id, pedido);
  }

  // -------------------- ELIMINAR --------------------
  eliminar(id: number): Observable<string> {
    return this.http.delete(
      `${this.url}/pedido/eliminar/${id}`,
      { responseType: 'text' }
    );
  }

  // -------------------- LISTAR POR ESTADO --------------------
  listarPorEstado(estado: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.url + '/pedidos/estado/' + estado);
  }

  // -------------------- LISTAR POR FECHA --------------------
  listarPorFecha(fecha: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.url + '/pedidos/fecha/' + fecha);
  }

  // -------------------- LISTAR POR CLIENTE --------------------
  listarPorCliente(cliente: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.url + '/pedidos/cliente/' + cliente);
  }
}
