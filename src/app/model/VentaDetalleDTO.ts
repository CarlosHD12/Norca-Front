import {PrendaDetalleVentaDTO} from './PrendaDetalleVentaDTO';

export interface VentaDetalleDTO {
  idVenta: number;
  codigo: string;
  fechaHora: string;
  metodoPago: string;
  total: number;
  estado: boolean;
  prendas: PrendaDetalleVentaDTO[];
}
