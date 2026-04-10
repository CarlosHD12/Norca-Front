export interface PrendaListadoDTO {
  idPrenda: number;
  categoriaId: number;
  categoriaNombre: string;
  marcaId: number;
  marcaNombre: string;
  material: string;
  descripcion: string;
  estado: string;
  stockActual: number;
  precioVenta: number;
  colores: string[];
}
