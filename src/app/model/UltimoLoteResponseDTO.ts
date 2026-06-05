import {InventarioHistorialDTO} from './InventarioHistorialDTO';

export interface UltimoLoteResponseDTO {
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
