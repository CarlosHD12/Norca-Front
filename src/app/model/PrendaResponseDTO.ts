export interface PrendaResponseDTO {
  idPrenda: number;
  codigo: string;
  nombre: string;
  material: string;
  descripcion: string;
  imagenUrl: string;
  colores: string[];
  categoria: string;
  marca: string;
  estado: string;
  activo: boolean;
  fechaRegistro: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
  actualizadoPor: string;
}
