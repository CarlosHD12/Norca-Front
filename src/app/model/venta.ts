import {DetalleVent} from './detalle-vent';

export class Venta {
  idVenta: number = 0;
  cliente: string;
  metodoPago: string;
  fechahoraVenta: Date = new Date();
  total: number = 0.0;
  detalles?: DetalleVent[] = [];
}
