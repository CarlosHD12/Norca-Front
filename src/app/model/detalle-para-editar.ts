import { Prenda } from "./prenda";
import { Talla } from "./talla";

export interface DetalleParaEditar {
  prenda: Prenda;
  cantidad: number;
  precioUnitario: number;
  subTotal: number;
  tallaSeleccionada: Talla;
  tallas: Talla[];
}
