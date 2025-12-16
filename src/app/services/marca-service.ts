import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Marca} from '../model/marca';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<Marca[]>();

  constructor() { }
  setList(listaNueva: Marca[]) {
    this.listaCambio.next(listaNueva);
  }
  getListaCambio(): Observable<Marca[]>{
    return this.listaCambio.asObservable();
  }

  // -------------------- GUARDAR --------------------
  insert(marca: Marca): Observable<any> {
    return this.http.post(this.url + '/marca', marca);
  }

  // -------------------- LISTAR TODAS --------------------
  list(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.url + '/marcas');
  }

  // -------------------- LISTAR POR CATEGORÍA --------------------
  listarPorCategoria(idCategoria: number): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.url + '/marcas/categoria/' + idCategoria);
  }
}
