import {TallaDetalleDTO} from './TallaDetalleDTO';

export interface PrendaDetalleVentaDTO {
  categoria: string;
  imagen: string;
  marca: string;
  material: string;
  descripcion: string;
  precioVentaUnitario: number;
  totalPrenda: number;
  detallesTalla: TallaDetalleDTO[];
}
