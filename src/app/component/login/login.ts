import {inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {ResponseDto} from '../../model/response-dto';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
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
    MatFormField,
    MatIcon,
    MatCard,
    MatInput,
    MatLabel,
    MatIconButton,
    MatButton,
    NgIf
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm: FormGroup;
  errorLogin: string = '';
  successLogin: string = '';
  hidePassword = true;

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {

    this.errorLogin = '';
    this.successLogin = '';

    if (this.loginForm.invalid) {
      this.errorLogin = 'El formulario está incompleto.';
      return;
    }

    const requestDto = new RequestDto();

    requestDto.username = this.loginForm.get('username')?.value;
    requestDto.password = this.loginForm.get('password')?.value;

    this.loginService.login(requestDto).subscribe({

      next: (data: ResponseDto) => {

        const rol = data.roles?.[0];

        this.authService.login(data.jwt);

        localStorage.setItem('rol', rol);
        localStorage.setItem('usuario', requestDto.username);

        this.successLogin = '¡Login exitoso! Redirigiendo...';

        setTimeout(() => {

          switch (rol) {

            case 'ROLE_ADMIN':
              this.router.navigate(['/PrendaHome']);
              break;

            case 'ROLE_AYUDANTE':
              this.router.navigate(['/PrendaHome']);
              break;

            default:
              this.router.navigate(['/PrendaHome']);
              break;
          }

        }, 700);
      },

      error: () => {
        this.errorLogin = 'Usuario o contraseña incorrectos.';
      }
    });
  }

}
