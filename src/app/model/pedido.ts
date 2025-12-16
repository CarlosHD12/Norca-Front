export class Pedido {
  idPedido: number = 0;
  cliente: string;
  descripcion?: string;
  fechaPedido: Date = new Date();
  estado: string;
}
