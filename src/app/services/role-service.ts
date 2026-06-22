import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Role} from '../model/Role';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';

@Injectable({providedIn: 'root'})
export class RoleService {

  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }
}
