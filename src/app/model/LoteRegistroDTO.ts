import {InventarioRegistroDTO} from './InventarioRegistroDTO';

export interface LoteRegistroDTO {
  cantidadInicial: number;
  precioCompraTotal: number;
  precioVenta: number;
  prendaId: number;
  inventarios: InventarioRegistroDTO[];
}
