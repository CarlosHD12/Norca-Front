import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Prenda} from '../model/prenda';
import {PrendaMetricas} from '../model/prendametricas';
import {Topprenda} from '../model/topprenda';

@Injectable({
  providedIn: 'root'
})
export class PrendaMetricaService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<Prenda[]>();


  constructor() { }

  getMetricas(id: number): Observable<PrendaMetricas> {
    return this.http.get<PrendaMetricas>(`${this.url}/prenda/metrica/${id}`);
  }

  getTop10() {
    return this.http.get<Topprenda[]>(`${this.url}/top10`);
  }

  getPrendasOlvidadas() {
    return this.http.get<any[]>(`${this.url}/olvidadas`);
  }

}
