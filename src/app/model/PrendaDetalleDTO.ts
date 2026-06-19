import {InventarioHistorialDTO} from './InventarioHistorialDTO';
import {ResumenLoteDTO} from './ResumenLoteDTO';

export interface PrendaDetalleDTO {
  idPrenda: number;
  codigo: string;
  nombre: string;
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
  codigoLote: string;
  cantidadInicial: number;
  stockActual: number;
  precioVenta: number;
  precioCompra: number;
  fechaIngreso: string;

  // INVENTARIOS
  inventarios: InventarioHistorialDTO[];

  // RESUMEN DEL LOTE
  resumen: ResumenLoteDTO;
}
