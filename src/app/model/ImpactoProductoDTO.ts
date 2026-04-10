import {ImpactoInventarioDTO} from './ImpactoInventarioDTO';

export interface ImpactoProductoDTO {
  categoria: string;
  marca: string;
  calidad: string;
  imagenCategoria: string;
  cantidadVendida: number;
  ingreso: number;
  costo: number;
  ganancia: number;
  inventarios: ImpactoInventarioDTO[];
}
