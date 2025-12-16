import {Prenda} from './prenda';
import {Talla} from './talla';
import {Venta} from './venta';

export class DetalleVent {
  idDV: number = 0;
  cantidad: number = 0;
  precioUnitario: number = 0;
  subTotal: number = 0;

  prenda: Prenda = new Prenda;

  venta: Venta = new Venta;

  talla: Talla = new Talla;
}
