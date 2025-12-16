import {Pedido} from './pedido';
import {Prenda} from './prenda';

export class DetallePed {
  idDP?: number = 0;

  pedido: Pedido = new Pedido();

  prenda: Prenda = new Prenda();
}
