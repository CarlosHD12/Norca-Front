import {LoteHistorialResponseDTO} from './LoteHistorialResponseDTO';

export interface HistorialPrendaResponseDTO {
  idPrenda: number;
  codigoPrenda: string;
  lotes: LoteHistorialResponseDTO[];
}
