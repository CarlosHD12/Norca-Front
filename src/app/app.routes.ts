import {Routes} from '@angular/router';
import {Login} from './component/login/login';
import {HomePrenda} from './component/home-prenda/home-prenda';
import {HomeVenta} from './component/home-venta/home-venta';
import {authGuard} from './auth-guard';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },

  {
    path: 'HomePrenda',
    component: HomePrenda,
    canActivate: [authGuard]
  },
  {
    path: 'HomeVenta',
    component: HomeVenta,
    canActivate: [authGuard]
  }
];
