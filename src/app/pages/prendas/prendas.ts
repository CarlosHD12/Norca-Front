import {Component, OnInit} from '@angular/core';
import {Sidebar} from '../../layout/sidebar/sidebar';
import {RouterOutlet} from '@angular/router';
import {Navbar} from '../../layout/navbar/navbar';
import {PrendaListResponseDTO} from '../../model/PrendaListResponseDTO';
import {PrendaTable} from './components/prenda-table/prenda-table';
import {PrendaService} from '../../services/prenda-service';
import {PrendaFilters} from './components/prenda-filters/prenda-filters';
import {PrendaFiltros} from '../../model/PrendaFiltros';
import {PrendaStats} from './components/prenda-stats/prenda-stats';
import {PrendaHeader} from './components/prenda-header/prenda-header';
import {ModalPrenda} from './modals/modal-prenda/modal-prenda';
import {NgIf} from '@angular/common';
import {RightSidebar} from '../../layout/right-sidebar/right-sidebar';
import {PrendaQuickDetailDTO} from '../../model/PrendaQuickDetalleDTO';

@Component({
  selector: 'app-prendas',
  imports: [
    Sidebar,
    RouterOutlet,
    Navbar,
    PrendaTable,
    PrendaFilters,
    PrendaStats,
    PrendaHeader,
    ModalPrenda,
    NgIf,
    RightSidebar
  ],
  templateUrl: './prendas.html',
  styleUrl: './prendas.css',
})
export class Prendas implements OnInit {

  sidebarExpanded = false;

  prendas: PrendaListResponseDTO[] = [];

  loading = false;

  totalPages = 0;

  page = 0;

  quickDetail: PrendaQuickDetailDTO | null = null;

  isRightSidebarOpen = false;

  filters: PrendaFiltros = {
    search: '',
    categoria: '',
    marca: '',
    estado: '',
    stockMin: null,
    stockMax: null,
    precioMin: null,
    precioMax: null,
    page: 0,
    size: 10
  };

  constructor(
    private prendaService: PrendaService
  ) {}

  ngOnInit(): void {
    this.loadPrendas();
  }

  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
  }

  onFiltersChange(filters: PrendaFiltros): void {

    this.filters = {
      ...this.filters,
      ...filters,
      page: 0
    };

    this.page = 0;

    this.loadPrendas();

  }


  mostrarModalPrenda = false;

  abrirModalPrenda(): void {

    this.mostrarModalPrenda = true;

  }

  cerrarModalPrenda(): void {
    this.mostrarModalPrenda = false;
  }

  onPrendaSelected(idPrenda: number): void {

    this.isRightSidebarOpen = true;

    this.prendaService
      .getQuickDetail(idPrenda)
      .subscribe({
        next: (response) => {

          this.quickDetail = response;

        },
        error: (error) => {

          console.error(error);

        }
      });
  }

  closeSidebar(): void {

    this.isRightSidebarOpen = false;

    this.quickDetail = null;

  }

  openSidebar(): void {
    this.isRightSidebarOpen = true;
  }

  loadPrendas(): void {

    this.loading = true;

    this.prendaService
      .listarPrendasFiltradas({
        ...this.filters,
        page: this.page,
        size: this.filters.size ?? 10
      })
      .subscribe({

        next: (response) => {

          this.prendas = response.content;
          this.totalPages = response.totalPages;

          this.loading = false;

        },

        error: (error) => {

          console.error(error);
          this.loading = false;

        }

      });

  }

  reloadPrendas(): void {

    this.filters = {
      search: '',
      categoria: '',
      marca: '',
      estado: '',
      stockMin: null,
      stockMax: null,
      precioMin: null,
      precioMax: null,
      page: 0,
      size: 10
    };

    this.page = 0;

    this.loadPrendas();

  }

  onPrendaGuardada(): void {

    this.cerrarModalPrenda();

    this.loadPrendas();

  }

  borradorPrenda: any = null;

  guardarBorrador(data: any): void {

    this.borradorPrenda = data;

  }

}
