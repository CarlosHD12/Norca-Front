import {Prenda} from './Prenda';
import {Inventario} from './Inventario';

export interface Lote {
  idLote: number;
  numeroLote: number;
  cantidad: number;
  stockActual: number;
  precioCompraTotal: number;
  precioVenta: number;
  fechaIngreso: Date;
  activo: boolean;
  prenda: Prenda;
  inventarios: Inventario[];
}
