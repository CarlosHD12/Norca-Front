import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Categoria} from '../model/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<Categoria[]>();

  constructor() { }
  // -------------------- GUARDAR --------------------
  insert(categoria: Categoria): Observable<any> {
    return this.http.post(this.url + "/categoria", categoria);
  }

  // -------------------- LISTAR TODAS --------------------
  list(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url + '/categorias');
  }
}
