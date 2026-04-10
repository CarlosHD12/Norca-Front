import {Venta} from './Venta';
import {Inventario} from './Inventario';

export interface DetalleVent {
  idDV: number;
  cantidad: number;
  precioVentaUnitario: number;
  costoUnitario: number;
  subtotal: number;
  stockAntes: number;
  stockDespues: number;
  venta: Venta;
  inventario: Inventario;
}
