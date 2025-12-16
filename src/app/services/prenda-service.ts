import {inject, Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable, Subject} from 'rxjs';
import {Prenda} from '../model/prenda';
import {Marca} from '../model/marca';
import {Lote} from '../model/lote';

@Injectable({
  providedIn: 'root'
})
export class PrendaService {
  private url: string= environment.apiUrl
  private http:HttpClient=inject(HttpClient)
  private listaCambio = new Subject<Prenda[]>();

  constructor() { }
  setList(listaNueva: Prenda[]) {
    this.listaCambio.next(listaNueva);
  }

  getById(id: number): Observable<Prenda> {
    return this.http.get<Prenda>(`${this.url}/detalle/prenda/${id}`);
  }

  actualizarLista(): void {
    this.list().subscribe({
      next: (data) => {
        const listaOrdenada = data.sort((a, b) => a.idPrenda! - b.idPrenda!);
        this.setList(listaOrdenada);
      },
      error: (err) => console.error('Error actualizando lista', err)
    });
  }

  // -------------------- GUARDAR --------------------
  insert(prenda: Prenda): Observable<any> {
    return this.http.post(this.url + '/prenda', prenda);

  }

  // -------------------- LISTAR TODAS --------------------
  list(): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(`${this.url}/prendas`).pipe(
      map(data => data || []) // por si backend devuelve null
    );
  }


  // -------------------- EDITAR --------------------
  update(id: number, prenda: Prenda): Observable<any> {
    return this.http.put(this.url + '/prenda/modificar/' + id, prenda);
  }

  // -------------------- FILTRAR POR MARCA --------------------
  listarPorMarca(idMarca: number): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(this.url + '/prendas/marca/' + idMarca);
  }

  // -------------------- FILTRAR POR CATEGORÍA --------------------
  listarPorCategoria(idCategoria: number): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(this.url + '/prendas/categoria/' + idCategoria);
  }

  // -------------------- FILTRAR POR CALIDAD --------------------
  listarPorCalidad(calidad: string): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(this.url + '/prendas/calidad/' + calidad);
  }

  // -------------------- FILTRAR POR ESTADO --------------------
  listarPorEstado(estado: string): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(this.url + '/prendas/estado/' + estado);
  }

  // -------------------- LISTAR TODAS LAS MARCAS --------------------
  listarMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.url + '/prendas/marcas');
  }

  // -------------------- FILTRAR POR RANGO DE PRECIO --------------------
  listarPorRangoPrecio(min: number, max: number): Observable<Prenda[]> {
    let params = new HttpParams().set('min', min).set('max', max);
    return this.http.get<Prenda[]>(this.url + '/prendas/rango', { params });
  }

  // -------------------- FILTRAR POR FECHA --------------------
  listarPorFecha(fecha: string): Observable<Prenda[]> {
    let params = new HttpParams().set('fecha', fecha);
    return this.http.get<Prenda[]>(this.url + '/prendas/fecha', { params });
  }

  // -------------------- ACTUALIZAR SOLO ESTADO --------------------
  actualizarEstado(id: number, estado: string): Observable<any> {
    let params = new HttpParams().set('estado', estado);
    return this.http.patch(this.url + '/prenda/estado/' + id, null, { params });
  }

  listarMarcasPorCategoria(idCategoria: number): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.url + '/marcas/categoria/' + idCategoria);
  }

  // -------------------- ELIMINAR PRENDA --------------------
  eliminar(id: number): Observable<string> {
    return this.http.delete<string>(`${this.url}/prenda/eliminar/${id}`);
  }

  // -------------------- VERIFICAR SI LA PRENDA EXISTE --------------------
  existePrenda(marcaId: number, calidad: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/prenda/existe`, {
      params: {
        marcaId: marcaId.toString(),
        calidad: calidad
      }
    });
  }

  buscarPrendas(
    descripcion?: string,
    idMarca?: number,
    idCategoria?: number,
    estado?: string,
    fecha?: string,
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<Prenda[]> {

    let params = new HttpParams();

    if (descripcion) params = params.set('descripcion', descripcion);
    if (idMarca) params = params.set('idMarca', idMarca);
    if (idCategoria) params = params.set('idCategoria', idCategoria);
    if (estado) params = params.set('estado', estado);
    if (fecha) params = params.set('busquedaFecha', fecha);
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);

    return this.http.get<Prenda[]>(`${this.url}/prendas/filtrar`, { params });
  }

  getLotesByPrenda(idPrenda: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.url}/lotes/${idPrenda}`);
  }

  getPrendasStockBajo(limite: number = 5): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(`${this.url}/bajo-stock?limite=${limite}`);
  }
}
