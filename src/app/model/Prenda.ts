import {Categoria} from './Categoria';
import {Marca} from './Marca';

export interface Prenda {
  idPrenda?: number;
  material: string;
  fechaRegistro?: Date;
  estado?: string;
  descripcion?: string;
  colores: string[];
  categoria: Categoria;
  marca: Marca;
}
