import {Marca} from './marca';
import {Talla} from './talla';

export class Prenda {
  idPrenda?: number;
  colores?: string[];
  calidad!: string;
  stock!: number;
  precioCompra!: number;
  precioVenta!: number;
  estado: 'Disponible' | 'Agotado' | 'Pedido' = 'Disponible';
  descripcion?: string;
  fechaRegistro: Date = new Date();
  marca!: Marca;
  tallas: Talla[] = [];
}

