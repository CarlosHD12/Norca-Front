import {InventarioHistorialDTO} from './InventarioHistorialDTO';

export interface LoteSeleccionadoDTO {
  idLote: number;
  codigoLote: string;
  precioVenta: number;
  inventarios: InventarioHistorialDTO[];
}
