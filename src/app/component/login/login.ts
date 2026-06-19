import {inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {ResponseDto} from '../../model/response-dto';
import {NgIf} from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder , Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {LoginService} from '../../services/login-service';
import {RequestDto} from '../../model/request-dto';
import {AuthService} from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm: FormGroup;
  errorLogin = '';
  successLogin = '';
  hidePassword = true;
  animandoLogin = false;

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.animandoLogin) {
      return;
    }

    this.errorLogin = '';
    this.successLogin = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorLogin = 'El formulario está incompleto.';
      return;
    }

    const requestDto = new RequestDto();
    requestDto.username = this.loginForm.get('username')?.value?.trim();
    requestDto.password = this.loginForm.get('password')?.value;

    this.loginService.login(requestDto).subscribe({
      next: (data: ResponseDto) => {
        const rol = data.roles?.[0] ?? '';

        this.authService.login(data.jwt);
        localStorage.setItem('rol', rol);
        localStorage.setItem('usuario', requestDto.username);

        this.successLogin = '¡Login exitoso! Redirigiendo...';
        this.animandoLogin = true;
        this.loginForm.disable();

        setTimeout(() => {
          switch (rol) {
            case 'ROLE_ADMIN':
            case 'ROLE_AYUDANTE':
            default:
              this.router.navigate(['/PrendaHome']);
              break;
          }
        }, 1500);
      },
      error: () => {
        this.animandoLogin = false;
        this.loginForm.enable();
        this.errorLogin = 'Usuario o contraseña incorrectos.';
      }
    });
  }

}
