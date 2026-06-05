import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterPayload } from '../foro.api';
import { GoogleAuthButtonComponent } from '../foro.ui';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, GoogleAuthButtonComponent],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  error = '';
  loading = false;

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router
  ) {}

  register(): void {
    this.loading = true;
    const data: RegisterPayload = {
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation,
    };
    this.auth.register(data).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        const msg = err.error?.message;
        this.error =
          typeof msg === 'string' && msg.includes('SQLSTATE')
            ? 'Error del servidor. Ejecuta: php artisan migrate'
            : msg || 'Error en el registro';
        this.loading = false;
      },
    });
  }
}
