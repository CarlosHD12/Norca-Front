import {LoteFIFODTO} from './LoteFIFODTO';

export interface PrendaQuickDetailDTO {
  idPrenda: number;
  codigo: string;
  nombre: string;
  imagenUrl: string;
  estado: string;
  stockTotal: number;
  lotesActivos: number;
  unidadesVendidasUltimos30Dias: number;
  loteFIFO: LoteFIFODTO | null;
}
