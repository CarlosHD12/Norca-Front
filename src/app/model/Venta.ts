import {DetalleVent} from './Detalle_Vent';

export interface Venta {
  idVenta: number;
  codigo: string;
  unidades: number;
  fechaHora: Date;
  metodoPago: string;
  total: number;
  estado: boolean;
  detalle_Vents: DetalleVent[];
}
