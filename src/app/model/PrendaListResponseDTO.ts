export interface PrendaListResponseDTO {
  idPrenda: number;
  codigo: string;
  categoriaId: number;
  marcaId: number;
  imagenUrl: string;
  nombre: string;
  categoria: string;
  marca: string;
  material: string;
  colores: string[];
  precioVenta: number;
  stock: number;
  descripcion: string;
  estado: string;
  fechaRegistro: string;
}
