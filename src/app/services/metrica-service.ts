import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Metrica} from '../model/Metrica';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetricaService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  obtenerMetricaPorPrenda(idPrenda: number): Observable<Metrica> {
    return this.http.get<Metrica>(`${this.baseUrl}/metrica/prenda/${idPrenda}`);
  }

  existeMetricaPorPrenda(idPrenda: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/prenda/${idPrenda}/exists`);
  }
}
