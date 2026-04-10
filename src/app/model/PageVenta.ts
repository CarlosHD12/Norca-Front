import {VentaListadoDTO} from './VentaListadoDTO';

export interface PageVenta {
  content: VentaListadoDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
