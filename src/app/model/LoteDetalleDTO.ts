import {HistorialDTO} from './HistorialDTO';

export interface LoteDetalleDTO {
  idLote: number;
  numeroLote: number;
  cantidad: number;
  stockActual: number;
  precioCompraTotal: number;
  precioVenta: number;
  fechaIngreso: string; // ISO string (LocalDate)
  activo: boolean;
  historiales: HistorialDTO[];
}
