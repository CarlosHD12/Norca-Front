import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PrendaService} from '../../../../services/prenda-service';
import {NgForOf, NgIf} from '@angular/common';
import {CategoriaResponseDTO} from '../../../../model/CategoriaResponseDTO';
import {MarcaResponseDTO} from '../../../../model/MarcaResponseDTO';
import {CategoriaService} from '../../../../services/categoria-service';
import {MarcaService} from '../../../../services/marca-service';
import {PrendaUpdateDTO} from '../../../../model/PrendaUpdateDTO';
import {PrendaRegistroDTO} from '../../../../model/PrendaRegistroDTO';

@Component({
  selector: 'app-modal-prenda',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './modal-prenda.html',
  styleUrl: './modal-prenda.css',
})
export class ModalPrenda  implements OnInit {

  @Output()
  draftSaved = new EventEmitter<any>();

  @Input()
  modoEdicion = false;

  @Input()
  idPrenda: number | null = null;

  @Input()
  datosPrenda: any = null;

  @Output()
  modalClose = new EventEmitter<void>();

  @Output()
  saved = new EventEmitter<void>();

  form!: FormGroup;

  categorias: CategoriaResponseDTO[] = [];

  marcas: MarcaResponseDTO[] = [];

  colores: string[] = [];

  submitted = false;

  closing = false;

  loading = false;

  fechaActual = '';

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private marcaService: MarcaService,
    private prendaService: PrendaService
  ) {}

  ngOnInit(): void {

    this.fechaActual = new Date().toLocaleDateString(
      'es-PE',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

    this.form = this.fb.group({

      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      material: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      descripcion: [
        '',
        [
          Validators.maxLength(255)
        ]
      ],

      imagenUrl: [
        '',
        [
          Validators.maxLength(500)
        ]
      ],

      categoriaId: [
        null,
        Validators.required
      ],

      marcaId: [
        null,
        Validators.required
      ]

    });

    this.loadCategorias();

    this.loadMarcas();

    if (this.datosPrenda) {

      this.form.patchValue({

        nombre: this.datosPrenda.nombre ?? '',

        material: this.datosPrenda.material ?? '',

        descripcion: this.datosPrenda.descripcion ?? '',

        imagenUrl: this.datosPrenda.imagenUrl ?? '',

        categoriaId: this.datosPrenda.categoriaId ?? null,

        marcaId: this.datosPrenda.marcaId ?? null

      });

      this.colores = [
        ...(this.datosPrenda.colores || [])
      ];

    }

  }

  loadCategorias(): void {

    this.categoriaService
      .listarCategorias()
      .subscribe({

        next: data => {

          this.categorias = data;

        },

        error: error => {

          console.error(error);

        }

      });

  }

  loadMarcas(): void {

    this.marcaService
      .listarMarcas()
      .subscribe({

        next: data => {

          this.marcas = data;

        },

        error: error => {

          console.error(error);

        }

      });

  }

  agregarColor(): void {

    this.colores.push('');

  }

  eliminarColor(color: string): void {

    this.colores =
      this.colores.filter(
        c => c !== color
      );

  }

  eliminarImagen(): void {

    this.form.patchValue({

      imagenUrl: ''

    });

  }

  limpiarFormulario(): void {

    this.submitted = false;

    this.colores = [];

    this.form.reset({

      nombre: '',

      material: '',

      descripcion: '',

      imagenUrl: '',

      categoriaId: null,

      marcaId: null

    });

  }

  cancelar(): void {

    this.limpiarFormulario();

    this.cerrarModal();

  }

  guardarBorrador(): void {
    this.draftSaved.emit({

      ...this.form.value,

      colores: [...this.colores]

    });

    this.cerrarModal();

  }

  guardar(): void {

    this.submitted = true;

    if (
      this.form.invalid
    ) {
      return;
    }

    this.loading = true;

    if (
      this.modoEdicion &&
      this.idPrenda
    ) {

      const dto: PrendaUpdateDTO = {

        nombre:
        this.form.value.nombre,

        material:
        this.form.value.material,

        descripcion:
        this.form.value.descripcion,

        imagenUrl:
        this.form.value.imagenUrl,

        categoriaId:
        this.form.value.categoriaId,

        marcaId:
        this.form.value.marcaId,

        colores:
          this.colores
            .filter(
              c => c.trim() !== ''
            )
            .map(
              c => c.trim()
            )

      };

      this.prendaService
        .actualizarPrenda(
          this.idPrenda,
          dto
        )
        .subscribe({

          next: () => {

            this.loading = false;

            this.saved.emit();

            this.cerrarModal();

          },

          error: error => {

            console.error(error);

            this.loading = false;

          }

        });

    } else {

      const dto: PrendaRegistroDTO = {

        nombre:
        this.form.value.nombre,

        material:
        this.form.value.material,

        descripcion:
        this.form.value.descripcion,

        imagenUrl:
        this.form.value.imagenUrl,

        categoriaId:
        this.form.value.categoriaId,

        marcaId:
        this.form.value.marcaId,

        colores:
          this.colores
            .filter(
              c => c.trim() !== ''
            )
            .map(
              c => c.trim()
            )

      };

      this.prendaService
        .registrarPrenda(dto)
        .subscribe({

          next: () => {

            this.loading = false;

            this.saved.emit();

            this.cerrarModal();

          },

          error: error => {

            console.error(error);

            this.loading = false;

          }

        });

    }

  }

  cerrarModal(): void {

    this.closing = true;

    setTimeout(() => {

      this.modalClose.emit();

    }, 250);

  }

  @HostListener('document:keydown.escape')
  onEscape(): void {

    this.cancelar();

  }

}
