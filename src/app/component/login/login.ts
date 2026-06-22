import {inject} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {NgIf} from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder , Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {AuthService} from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  registerForm: FormGroup;

  modoRegistro = false;

  errorLogin = '';
  successLogin = '';

  hidePassword = true;
  hideRegisterPassword = true;

  animandoLogin = false;

  constructor() {

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });

  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleRegisterPassword(): void {
    this.hideRegisterPassword = !this.hideRegisterPassword;
  }

  cambiarModo(): void {

    this.modoRegistro = !this.modoRegistro;

    this.errorLogin = '';
    this.successLogin = '';

    this.loginForm.reset();
    this.registerForm.reset();
  }

  login(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorLogin = '';
    this.animandoLogin = true;

    this.authService.login(this.loginForm.value)
      .subscribe({

        next: (response) => {

          this.authService.saveSession(response);

          localStorage.setItem(
            'role',
            response.role
          );

          this.successLogin =
            'Ingreso correcto';

          setTimeout(() => {

            this.router.navigate([
              '/PrendaHome'
            ]);

          }, 1200);
        },

        error: () => {

          this.animandoLogin = false;

          this.errorLogin =
            'Usuario o contraseña incorrectos';
        }
      });
  }

  register(): void {

    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorLogin = '';

    this.authService
      .register(this.registerForm.value)
      .subscribe({

        next: () => {

          this.successLogin =
            'Usuario registrado correctamente';

          this.modoRegistro = false;

          this.registerForm.reset();
        },

        error: (err) => {

          this.errorLogin =
            err?.error ||
            'No se pudo registrar el usuario';
        }
      });
  }

}
