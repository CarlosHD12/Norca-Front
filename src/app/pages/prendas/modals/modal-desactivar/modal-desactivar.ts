import {Component, EventEmitter, inject, Input, OnChanges, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-modal-desactivar',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './modal-desactivar.html',
  styleUrl: './modal-desactivar.css',
})
export class ModalDesactivar {

  @Output() closeDesactivar = new EventEmitter<void>();

  @Input() idPrenda: number | null = null;

  closing = false;

  private fb = inject(FormBuilder);


  form: FormGroup = this.fb.group({
    idPrenda: [null],
    codigo: [''],
    nombre: [''],
    imagenUrl: [''],
    categoria: [''],
    marca: [''],
    estado: [''],
    fechaRegistro: [null],
    material: [''],
    descripcion: [''],
    colores: [[]],
    idLote: [null],
    cantidadInicial: [0],
    stockActual: [0],
    precioVenta: [0],
    fechaIngreso: [null]
  });

  cerrarDesactivar(): void {
    this.closing = true;
    setTimeout(() => {
      this.closeDesactivar.emit();
    }, 250);
  }
}
