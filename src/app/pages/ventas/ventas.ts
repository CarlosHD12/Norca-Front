import { Component } from '@angular/core';
import {ModalPrenda} from '../prendas/modals/modal-prenda/modal-prenda';
import {Navbar} from '../../layout/navbar/navbar';
import {NgIf} from '@angular/common';
import {PrendaFilters} from '../prendas/components/prenda-filters/prenda-filters';
import {PrendaHeader} from '../prendas/components/prenda-header/prenda-header';
import {PrendaStats} from '../prendas/components/prenda-stats/prenda-stats';
import {PrendaTable} from '../prendas/components/prenda-table/prenda-table';
import {RouterOutlet} from '@angular/router';
import {Sidebar} from '../../layout/sidebar/sidebar';
import {PrendaListResponseDTO} from '../../model/PrendaListResponseDTO';
import {PrendaFiltros} from '../../model/PrendaFiltros';
import {PrendaService} from '../../services/prenda-service';

@Component({
  selector: 'app-ventas',
  imports: [
    Navbar,
    RouterOutlet,
    Sidebar
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas {
  sidebarExpanded = false;

  prendas: PrendaListResponseDTO[] = [];

  loading = false;

  totalPages = 0;

  page = 0;

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

  onSidebarToggle(
    value: boolean
  ): void {

    this.sidebarExpanded = value;

  }

  onFiltersChange(
    filters: PrendaFiltros
  ): void {

    this.filters = {
      ...this.filters,
      ...filters,
      page: 0
    };

    this.page = 0;

    this.loadPrendas();

  }

  loadPrendas(): void {

    this.loading = true;

    this.prendaService
      .listarPrendasFiltradas({

        ...this.filters,

        page: this.page,

        size: 10

      })
      .subscribe({

        next: (response) => {

          this.prendas =
            response.content;

          this.totalPages =
            response.totalPages;

          this.loading = false;

        },

        error: (error) => {

          console.error(error);

          this.loading = false;

        }

      });
  }

  mostrarModalPrenda = false;

  abrirModalPrenda() {
    this.mostrarModalPrenda = true;
  }

  cerrarModalPrenda() {
    this.mostrarModalPrenda = false;
  }
}
