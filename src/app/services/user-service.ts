import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/User';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  listar(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  asignarRol(userId: number, roleId: number): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${userId}/role/${roleId}`,
      {},
      { responseType: 'text' }
    );
  }

  activar(id: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/${id}/enable`,
      {},
      { responseType: 'text' }
    );
  }

  desactivar(id: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/${id}/disable`,
      {},
      { responseType: 'text' }
    );
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { responseType: 'text' }
    );
  }
}
