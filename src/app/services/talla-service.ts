import {inject, Injectable} from '@angular/core';
import {Talla} from '../model/talla';
import {Observable, Subject} from 'rxjs';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Marca} from '../model/marca';
import {Prenda} from '../model/prenda';

@Injectable({
  providedIn: 'root'
})
export class TallaService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<Talla[]>();

  constructor() { }
  setList(listaNueva: Talla[]) {
    this.listaCambio.next(listaNueva);
  }

  getListaCambio(): Observable<Talla[]>{
    return this.listaCambio.asObservable();
  }

  // -------------------- GUARDAR --------------------
  insert(talla: Talla): Observable<any> {
    return this.http.post(this.url + '/talla', talla);
  }

  // -------------------- LISTAR TODAS --------------------
  listar(): Observable<Talla[]> {
    return this.http.get<Talla[]>(this.url + '/tallas');
  }

  // -------------------- LISTAR POR PRENDA --------------------
  listarPorPrenda(idPrenda: number): Observable<Talla[]> {
    return this.http.get<Talla[]>(this.url + '/tallas/prenda/' + idPrenda);
  }

  // -------------------- EDITAR --------------------
  actualizar(id: number, talla: Talla): Observable<any> {
    return this.http.put(this.url + '/talla/modificar/' + id, talla);
  }

  // -------------------- ELIMINAR --------------------
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/prenda/eliminar/${id}`);
  }
}
