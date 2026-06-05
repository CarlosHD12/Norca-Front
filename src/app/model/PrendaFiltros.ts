export interface PrendaFiltros {
  search?: string;
  categoria?: string;
  marca?: string;
  estado?: string;
  stockMin?: number | null;
  stockMax?: number | null;
  precioMin?: number | null;
  precioMax?: number | null;
  page?: number;
  size?: number;
}
