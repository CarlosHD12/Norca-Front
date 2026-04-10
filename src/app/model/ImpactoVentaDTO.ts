import {ImpactoProductoDTO} from './ImpactoProductoDTO';

export interface ImpactoVentaDTO {
  codigoVenta: string;
  fecha: string;
  ingresoTotal: number;
  costoTotal: number;
  ganancia: number;
  margen: number;
  productos: ImpactoProductoDTO[];
  analisis: string;
}
