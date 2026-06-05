export interface VentaResponseDTO {
  idVenta: number;
  codigo: string;
  unidades: number;
  total: number;
  metodoPago: string;
  estadoVenta: string;
  fechaHora: string;
}
