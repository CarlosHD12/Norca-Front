export interface InventarioActivoDTO {
  idLote: number;
  stockLote: number;
  precioVenta: number;
  idInventario: number;
  stock: number;
  nombreTalla: string;
}

export interface InventarioCarritoDTO extends InventarioActivoDTO {
  cantidadSeleccionada: number;
  cantidadEnCarrito?: number;
}
