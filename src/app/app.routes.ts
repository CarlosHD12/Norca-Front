import {Routes} from '@angular/router';
import {Login} from './component/login/login';
import {HomePrenda} from './component/home-prenda/home-prenda';
import {HomeVenta} from './component/home-venta/home-venta';

export const routes: Routes = [
  {path: '', component: Login, pathMatch: 'full'},
  {path: 'HomePrenda', component: HomePrenda},
  {path: 'HomeVenta', component: HomeVenta},
];
