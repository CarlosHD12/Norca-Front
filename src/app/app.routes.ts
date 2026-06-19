import {Routes} from '@angular/router';
import {Login} from './component/login/login';
import {authGuard} from './auth-guard';
import {Prendas} from './pages/prendas/prendas';
import {Ventas} from './pages/ventas/ventas';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  {
    path: 'PrendaHome',
    component: Prendas,
    canActivate: [authGuard]
  },
  {
    path: 'VentaHome',
    component: Ventas,
    canActivate: [authGuard]
  },
  {
    path: 'HomeVenta',
    component: Prendas,
    canActivate: [authGuard]
  }
];
