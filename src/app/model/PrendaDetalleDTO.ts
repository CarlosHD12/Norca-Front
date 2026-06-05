import {LoteDetalleDTO} from './LoteDetalleDTO';
import {InventarioHistorialDTO} from './InventarioHistorialDTO';
import {MetricaLoteDTO} from './MetricaLoteDTO';

export interface PrendaDetalleDTO {
  idPrenda: number;
  codigo: string;
  imagenUrl: string;
  categoria: string;
  marca: string;
  estado: string;
  fechaRegistro: string;
  material: string;
  descripcion: string;
  colores: string[];

  // ÚLTIMO LOTE ACTIVO
  idLote: number;
  cantidadInicial: number;
  stockActual: number;
  precioVenta: number;
  fechaIngreso: string;

  // INVENTARIOS
  inventarios: InventarioHistorialDTO[];

  // MÉTRICAS DEL LOTE
  metricas: MetricaLoteDTO;
}
