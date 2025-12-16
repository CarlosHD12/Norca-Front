import {Routes} from '@angular/router';
import {Login} from './component/login/login';
import {Home} from './component/home/home';
import {PrendaHome} from './component/prenda-home/prenda-home';
import {PedidoHome} from './component/pedido-home/pedido-home';
import {VentaHome} from './component/venta-home/venta-home';
import {PrendaBuscador} from './component/prenda-buscador/prenda-buscador';
import {PrendaBuscadorVenta} from './component/prenda-buscador-venta/prenda-buscador-venta';

export const routes: Routes = [
  {path: '', component: Login, pathMatch: 'full'},
  {path: 'home', component: Home},
  {path: 'prendaHome', component: PrendaHome},
  {path: 'pedidoHome', component: PedidoHome},
  {path: 'ventaHome', component: VentaHome},
  {path: 'prendaBuscar', component: PrendaBuscador},
  {path: 'prendaBuscarVentas', component: PrendaBuscadorVenta},
];
