import {LoteDetalleDTO} from './LoteDetalleDTO';

export interface PrendaDetalleDTO {
  idPrenda: number;
  material: string;
  fechaRegistro: string;
  estado: string;
  descripcion: string;
  colores: string[];
  nombreCategoria: string;
  imagen: string;
  nombreMarca: string;
  loteActivo: LoteDetalleDTO;
}
