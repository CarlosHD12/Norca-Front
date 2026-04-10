export interface CrearVentaDTO {
  metodoPago: string;
  detalles: {
    cantidad: number;
    inventario: { idInventario: number };
  }[];
}
