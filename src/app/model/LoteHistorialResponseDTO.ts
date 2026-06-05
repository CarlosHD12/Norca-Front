import {InventarioHistorialDTO} from './InventarioHistorialDTO';

export interface LoteHistorialResponseDTO {
  idLote: number;
  codigoLote: string;
  cantidadInicial: number;
  stockActual: number;
  precioCompraTotal: number;
  precioVenta: number;
  activo: boolean;
  fechaIngreso: string;
  inventarios: InventarioHistorialDTO[];
}
