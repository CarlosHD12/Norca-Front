export interface PrendaListResponseDTO {
  idPrenda: number;
  codigo: string;
  imagenUrl: string;
  nombre: string;
  categoria: string;
  marca: string;
  material: string;
  colores: string[];
  precioVenta: number;
  stock: number;
  estado: string;
}
