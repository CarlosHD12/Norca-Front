import {Routes} from '@angular/router';
import {Login} from './component/login/login';
import {HomePrenda} from './component/home-prenda/home-prenda';
import {authGuard} from './auth-guard';
import {Prendas} from './pages/prendas/prendas';
import {Ventas} from './pages/ventas/ventas';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  {
    path: 'HomePrenda',
    component: HomePrenda,
    canActivate: [authGuard]
  },
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
    component: HomePrenda,
    canActivate: [authGuard]
  }
];
