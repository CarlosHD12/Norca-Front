import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Prenda} from '../../model/prenda';
import {Talla} from '../../model/talla';
import {PrendaService} from '../../services/prenda-service';
import {CategoriaService} from '../../services/categoria-service';
import {FormsModule} from '@angular/forms';
import {MatOption, MatSelect, MatSelectModule} from '@angular/material/select';
import {MatNativeDateModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {DetalleVent} from '../../model/detalle-vent';
import {MatIconButton} from '@angular/material/button';
import {MarcaService} from '../../services/marca-service';
import {DetalleParaEditar} from '../../model/detalle-para-editar';
import {Venta} from '../../model/venta';


@Component({
  selector: 'app-prenda-buscador-venta',
  imports: [
    FormsModule,
    MatOption,
    MatSelectModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelect,
    MatIcon,
    MatIconButton,
  ],
  templateUrl:'./prenda-buscador-venta.html',
  styleUrl:'./prenda-buscador-venta.css'
})
export class PrendaBuscadorVenta implements OnInit {
  prendas: Prenda[] = [];
  listaFiltrada: Prenda[] = [];

  categoriasFiltro: any[] = [];
  marcasFiltro: any[] = [];

  idMarcaFiltro2: number | null = null;
  idCategoriaFiltro2: number | null = null;

  busquedaDescripcionPr: string = '';
  busquedaCalidadPr: string = '';

  // Modal de tallas
  prendaSeleccionada: Prenda | null = null;
  tallasSeleccionadas: { talla: Talla, cantidad: number }[] = [];

  // Lista final para agregar a la venta
  detallesSeleccionados: DetalleVent[] = [];


  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<DetalleVent[]>();
  @Input() prendasIniciales: DetalleParaEditar[] = [];
  @Input() venta: Venta | null = null;   // Venta completa con detalles


  constructor(
    private prendaService: PrendaService,
    private marcaService: MarcaService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.cargarPrendas();
    this.cargarCategorias();
  }

  cargarPrendas() {
    this.prendaService.list().subscribe({
      next: data => {
        this.prendas = data.filter(p => p.estado === 'Disponible');
        this.listaFiltrada = [...this.prendas];

        this.cargarDetallesIniciales();
      },
      error: err => console.error('Error cargando prendas', err)
    });
  }


  cargarCategorias() {
    this.categoriaService.list().subscribe({
      next: cats => this.categoriasFiltro = cats,
      error: err => console.error('Error cargando categorías', err)
    });
  }

  aplicarFiltros() {
    this.listaFiltrada = this.prendas.filter(p => {
      const matchDescripcion = this.busquedaDescripcionPr
        ? p.descripcion?.toLowerCase().includes(this.busquedaDescripcionPr.toLowerCase())
        : true;

      const matchCalidad = this.busquedaCalidadPr
        ? p.calidad?.toLowerCase().includes(this.busquedaCalidadPr.toLowerCase())
        : true;

      const matchCategoria = this.idCategoriaFiltro2
        ? p.marca?.categoria?.idCategoria === this.idCategoriaFiltro2
        : true;

      const matchMarca = this.idMarcaFiltro2
        ? p.marca?.idMarca === this.idMarcaFiltro2
        : true;

      const matchDisponible = p.estado === 'Disponible';
      const tieneTallasConStock = p.tallas?.some(t => t.cantidad > 0);

      return (
        matchDescripcion &&
        matchCalidad &&
        matchCategoria &&
        matchMarca &&
        matchDisponible &&
        tieneTallasConStock
      );
    });
  }

  abrirModalTallas(prenda: Prenda) {
    this.prendaSeleccionada = prenda;

    // Solo tallas con stock > 0
    this.tallasSeleccionadas = prenda.tallas
      .filter(t => t.cantidad > 0)
      .map(t => ({ talla: t, cantidad: 0 }));
  }

  eliminarDetalle(detalle: DetalleVent) {

    const prenda = this.prendas.find(p => p.idPrenda === detalle.prenda.idPrenda);
    if (!prenda) return;

    // 1. Devolver la cantidad eliminada a la talla original
    const tallaOriginal = prenda.tallas.find(t => t.idTalla === detalle.talla.idTalla);
    if (tallaOriginal) {
      tallaOriginal.cantidad += detalle.cantidad;
    }

    // 2. Actualizar stock total (por si lo manejas aparte)
    prenda.stock = prenda.tallas.reduce((acc, t) => acc + t.cantidad, 0);

    // 3. Eliminar detalle de la derecha
    this.detallesSeleccionados = this.detallesSeleccionados.filter(d => d !== detalle);

    // 4. Recalcular lista izquierda
    this.aplicarFiltros();

  }

  cerrarModal() {
    this.cerrar.emit();
  }


  confirmarSeleccion() {
    this.confirmar.emit(this.detallesSeleccionados);
    this.cerrar.emit(); // Cierra el modal
  }

  confirmarTallas() {
    if (!this.prendaSeleccionada) return;

    this.tallasSeleccionadas
      .filter(ts => ts.cantidad > 0)
      .forEach(ts => {

        // Evitar duplicados cuando editas
        const yaExiste = this.detallesSeleccionados.some(d =>
          d.prenda.idPrenda === this.prendaSeleccionada!.idPrenda &&
          d.talla.idTalla === ts.talla.idTalla
        );

        if (yaExiste) return;

        // ======================
        // 1. Crear el detalle
        // ======================
        const detalle = new DetalleVent();
        detalle.cantidad = ts.cantidad;
        detalle.precioUnitario = this.prendaSeleccionada!.precioVenta;
        detalle.subTotal = ts.cantidad * this.prendaSeleccionada!.precioVenta;
        detalle.prenda = this.prendaSeleccionada!;
        detalle.talla = ts.talla;

        this.detallesSeleccionados.push(detalle);

        // ======================
        // 2. RESTAR STOCK A LA TALLA
        // ======================
        const tallaOriginal = this.prendaSeleccionada!.tallas
          .find(t => t.idTalla === ts.talla.idTalla);

        if (tallaOriginal) {
          tallaOriginal.cantidad -= ts.cantidad;
        }
      });

    // =================================
    // 3. Recalcular stock total
    // =================================
    this.prendaSeleccionada!.stock =
      this.prendaSeleccionada!.tallas.reduce((sum, t) => sum + t.cantidad, 0);

    // Cerrar modal y limpiar
    this.prendaSeleccionada = null;
    this.tallasSeleccionadas = [];

    // Volver a filtrar según stock restante
    this.aplicarFiltros();
  }

  truncarDescripcion(texto: string | undefined, limite: number = 40): string {
    if (!texto) return '—'; // maneja null, undefined o string vacío
    return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
  }

  onCategoriaFiltroChange2(): void {
    this.idMarcaFiltro2 = null;
    this.marcasFiltro = [];

    if (this.idCategoriaFiltro2 !== null) {
      this.marcaService.listarPorCategoria(this.idCategoriaFiltro2).subscribe({
        next: (marcas) => this.marcasFiltro = marcas,
        error: (err) => console.error('Error al cargar marcas', err)
      });
    }

    this.aplicarFiltros();
  }

  reiniciarFiltros() {
    this.busquedaDescripcionPr = '';
    this.busquedaCalidadPr = '';
    this.idCategoriaFiltro2 = null;
    this.idMarcaFiltro2 = null;
    this.aplicarFiltros();
  }

  get detallesAgrupados() {
    const grupos: any[] = [];

    this.detallesSeleccionados.forEach(det => {
      let grupo = grupos.find(g => g.prenda.idPrenda === det.prenda.idPrenda);

      if (!grupo) {
        grupo = {
          prenda: det.prenda,
          tallas: []
        };
        grupos.push(grupo);
      }

      grupo.tallas.push(det);
    });

    return grupos;
  }

  getImagenCategoria(prenda: any): string {
    const nombreCat = prenda.marca?.categoria?.nombre;

    if (!nombreCat) return '/default.png';

    // Pasar a minúsculas y quitar espacios si es necesario
    const nombreNormalizado = nombreCat.toLowerCase().replace(/\s+/g, '');

    return `/${nombreNormalizado}.png`;
  }

  private cargarDetallesIniciales() {
    if (!this.prendasIniciales || this.prendasIniciales.length === 0) return;

    this.detallesSeleccionados = [];

    this.prendasIniciales.forEach(pi => {
      const prendaOriginal = this.prendas.find(p => p.idPrenda === pi.prenda.idPrenda);
      if (!prendaOriginal) return;

      const tallaOriginal = prendaOriginal.tallas.find(t => t.idTalla === pi.tallaSeleccionada.idTalla);
      if (!tallaOriginal) return;

      // Crear detalle
      const det = new DetalleVent();
      det.prenda = prendaOriginal;
      det.talla = tallaOriginal;
      det.cantidad = pi.cantidad;
      det.precioUnitario = pi.precioUnitario;
      det.subTotal = pi.subTotal;

      this.detallesSeleccionados.push(det);

      // Restar stock igual que al agregar
      tallaOriginal.cantidad -= pi.cantidad;
    });

    // Recalcular stock total de cada prenda
    this.prendas.forEach(p => {
      p.stock = p.tallas.reduce((acc, t) => acc + t.cantidad, 0);
    });

    // Aplicar filtros actualizados
    this.aplicarFiltros();
  }


}
