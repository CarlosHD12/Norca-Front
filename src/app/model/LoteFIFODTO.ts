import {InventarioHistorialDTO} from './InventarioHistorialDTO';

export interface LoteFIFODTO {
  idLote: number;
  codigoLote: string;
  activo: boolean;
  fechaIngreso: string;
  cantidadInicial: number;
  stockActual: number;
  precioVenta: number;
  inventarios: InventarioHistorialDTO[];
}
