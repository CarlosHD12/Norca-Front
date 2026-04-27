import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  login(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    this.isLoggedInSubject.next(false);
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
