export interface LoteResponseDTO {
  idLote: number;
  codigoLote: string;
  cantidadInicial: number;
  stockActual: number;
  precioCompraTotal: number;
  precioVenta: number;
  fechaIngreso: string;
  activo: boolean;
  prendaCodigo: string;
}
