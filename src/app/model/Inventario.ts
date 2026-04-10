import {Lote} from './Lote';
import {DetalleVent} from './Detalle_Vent';
import {Talla} from './Talla';

export interface Inventario {
  idInventario: number;
  stock: number;
  lote: Lote;
  talla: Talla;
  detalle_Vents: DetalleVent[];
}
