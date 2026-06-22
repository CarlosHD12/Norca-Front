import {Component, Input, OnInit, ViewChild} from '@angular/core';
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
import {Paginator} from '../../layout/paginator/paginator';
import {ModalLote} from './modals/modal-lote/modal-lote';
import {ModalDetalle} from './modals/modal-detalle/modal-detalle';
import {ModalHistorial} from './modals/modal-historial/modal-historial';
import {ModalDesactivar} from './modals/modal-desactivar/modal-desactivar';
import {ModalMovimiento} from './modals/modal-movimiento/modal-movimiento';

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
    RightSidebar,
    Paginator,
    ModalLote,
    ModalDetalle,
    ModalHistorial,
    ModalDesactivar,
    ModalMovimiento
  ],
  templateUrl: './prendas.html',
  styleUrl: './prendas.css',
})
export class Prendas implements OnInit {

  loadingTabla = false;

  sidebarExpanded = false;

  prendas: PrendaListResponseDTO[] = [];

  totalPages = 0;

  totalElements = 0;

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
    size: Number(localStorage.getItem('prendas-page-size') ?? 10)
  };

  mostrarModalPrenda = false;

  modoEdicion = false;

  prendaSeleccionada: PrendaListResponseDTO | null = null;

  constructor(
    private prendaService: PrendaService
  ) {}

  @ViewChild(PrendaFilters)
  prendaFilters!: PrendaFilters;

  ngOnInit(): void {

    const savedSize = localStorage.getItem('prendas-page-size');

    console.log('SIZE GUARDADO:', savedSize);

    if (savedSize) {
      this.filters.size = Number(savedSize);
    }

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

  onPrendaSelected(idPrenda: number): void {
    console.log('ID SELECCIONADO', idPrenda);

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

  loadPrendas(): void {

    this.loadingTabla = true;

    this.prendaService
      .listarPrendasFiltradas({
        ...this.filters,
        page: this.page,
        size: this.filters.size ?? 10
      })
      .subscribe({
        next: (response) => {

            this.prendas = response.content;
            this.page = response.number;
            this.totalPages = response.totalPages;
            this.totalElements = response.totalElements;

            this.loadingTabla = false;

        },
        error: (error) => {

          console.error(error);

        }
      });
  }

  reloadPrendas(): void {

    this.loadingTabla = true;

    this.prendaFilters?.resetFilters();

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
      size: Number(localStorage.getItem('prendas-page-size') ?? 10)
    };

    this.page = 0;

    this.loadPrendas();
  }

  abrirModalPrenda(): void {
    this.modoEdicion = false;
    this.prendaSeleccionada = null;
    this.mostrarModalPrenda = true;
    this.bloquearScroll();
  }

  onEditarPrenda(prenda: any): void {
    this.modoEdicion = true;
    this.prendaSeleccionada = prenda;
    this.mostrarModalPrenda = true;
    this.bloquearScroll();
  }

  cerrarModalPrenda(): void {
    this.mostrarModalPrenda = false;
    this.prendaSeleccionada = null;
    this.modoEdicion = false;
    this.restaurarScroll();
  }

  onPrendaGuardada(): void {
    this.cerrarModalPrenda();
    this.reloadPrendas();
  }

  onBuscarPrenda(data: any): void {
    this.prendaFilters.filters.search = data.search ?? '';
    this.prendaFilters.filters.categoria = data.categoria ?? '';
    this.prendaFilters.filters.marca = data.marca ?? '';
    this.filters.search = data.search ?? '';
    this.filters.categoria = data.categoria ?? '';
    this.filters.marca = data.marca ?? '';
    this.page = 0;
    this.loadPrendas();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadPrendas();
  }

  onSizeChange(size: number): void {
    localStorage.setItem(
      'prendas-page-size',
      size.toString()
    );
    this.filters.size = size;
    this.page = 0;
    this.loadPrendas();
  }

  private bloquearScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private restaurarScroll(): void {
    document.body.style.overflow = '';
  }

  mostrarModalLote = false;
  mostrarModalDetalle = false;
  mostrarModalHistorial = false;
  mostrarModalDesactivar = false;
  mostrarModalMovimiento = false;

  idPrendaSeleccionada: number | null = null;
  codigoPrendaSeleccionada: string | null = null;
  estadoPrendaSeleccionada: string = '';

  abrirModalLote(idPrenda: number): void {
    this.idPrendaSeleccionada = idPrenda;
    this.codigoPrendaSeleccionada =
      this.prendas.find(p => p.idPrenda === idPrenda)?.codigo ?? null;
    this.mostrarModalLote = true;
    this.bloquearScroll();
  }

  abrirModalDetalle(idPrenda: number): void {
    this.idPrendaSeleccionada = idPrenda;
    this.codigoPrendaSeleccionada =
      this.prendas.find(p => p.idPrenda === idPrenda)?.codigo ?? null;
    this.mostrarModalDetalle = true;
    this.bloquearScroll();
  }

  abrirModalHistorial(idPrenda: number): void {
    this.idPrendaSeleccionada = idPrenda;
    this.mostrarModalHistorial = true;
    this.bloquearScroll();
  }

  abrirModalDesactivar(idPrenda: number): void {
    const prenda = this.prendas.find(
      p => p.idPrenda === idPrenda
    );
    if (!prenda) {
      return;
    }
    this.idPrendaSeleccionada = prenda.idPrenda;
    this.estadoPrendaSeleccionada = prenda.estado;
    this.codigoPrendaSeleccionada = prenda.codigo;
    this.mostrarModalDesactivar = true;
    this.bloquearScroll();
  }

  abrirModalMovimiento(idPrenda: number): void {
    this.idPrendaSeleccionada = idPrenda;
    this.codigoPrendaSeleccionada = this.prendas.find(p => p.idPrenda === idPrenda)?.codigo ?? null;
    this.mostrarModalMovimiento = true;
    this.bloquearScroll();
  }

  cerrarModalLote(): void {
    this.mostrarModalLote = false;
    this.idPrendaSeleccionada = null;
    this.restaurarScroll();
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.idPrendaSeleccionada = null;
    this.restaurarScroll();
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.idPrendaSeleccionada = null;
    this.restaurarScroll();
  }

  cerrarModalDesactivar(): void {
    this.mostrarModalDesactivar = false;
    this.idPrendaSeleccionada = null;
    this.estadoPrendaSeleccionada = '';
    this.restaurarScroll();
  }

  cerrarModalMovimiento(): void {
    this.mostrarModalMovimiento = false;
    this.idPrendaSeleccionada = null;
    this.restaurarScroll();
  }

  onLoteGuardado(): void {
    this.cerrarModalLote();
    this.reloadPrendas();
  }
}
