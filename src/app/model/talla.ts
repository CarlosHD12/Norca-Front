import {Prenda} from './prenda';

export class Talla {
  idTalla?: number; // ahora opcional
  size: string;
  cantidad: number = 0;

  prenda?: Prenda = new Prenda();
}
