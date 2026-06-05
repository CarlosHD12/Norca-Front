import {DetalleVentaRegistroDTO} from './DetalleVentaRegistroDTO';

export interface VentaRegistroDTO {
  metodoPago: MetodoPago;
  detalles: DetalleVentaRegistroDTO[];
}

export enum MetodoPago {
  EFECTIVO = "EFECTIVO",
  YAPE = "YAPE",
  PLIN = "PLIN",
  TARJETA = "TARJETA"
}
