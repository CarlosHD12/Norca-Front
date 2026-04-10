export interface VentaListadoDTO {
  idVenta: number;
  codigo: string;
  unidades: number;
  fechaHora: string;
  metodoPago: string;
  total: number;
  estado: boolean;
}
