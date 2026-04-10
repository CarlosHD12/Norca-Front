export interface PrendaCarritoDTO {
  idPrenda: number;
  categoria: string;
  imagen: string;
  marca: string;
  material: string;
  descripcion: string;
  precioVenta: number;
  stock: number;
  stockOriginal?: number;
}
