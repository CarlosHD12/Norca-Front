export interface PrendaOlvidadaDTO {
  idPrenda: number;
  categoria: string;
  marca: string;
  material: string;
  descripcion: string;
  stockActual: number;
  fechaUltimoLote: Date;
  fechaUltimaVenta: Date;
}
