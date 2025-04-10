import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private auth = inject(AuthService)
  isLoading = signal(false);
  errorMessage = signal('');

  form = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  })

  get emailIsInvalid() {
    return (
      this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
    )
  }

  get passwordIsInvalid() {
    return (
      this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
    )
  }

  onSubmit() {
    const email = this.form.controls.email.value;
    const password = this.form.controls.password.value
    console.log(email, password);
    this.isLoading.set(true);
    if(email && password) {
      this.auth.login(email, password).subscribe({
        next: response => {console.log(response); this.isLoading.set(false)},
        error: err => {console.log(err); this.isLoading.set(false); this.errorMessage.set(this.getErrorMessage(err))},
      });
    }
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    switch (true) {
      case err.error instanceof ErrorEvent:
        // Erro de rede ou erro do lado do cliente
        return `Network error: ${err.error.message}`;

      case typeof err.error === 'string':
        // Quando o backend retorna apenas uma string de erro
        return err.error;

      case !!err.error?.message:
        // Quando o backend retorna um objeto com propriedade 'message'
        return err.error.message;

      case !!err.message:
        // Mensagem padrão do HttpErrorResponse
        return err.message;

      case err.status === 0:
        // Servidor não respondeu (CORS, offline, etc)
        return 'Unable to connect to the server';

      case err.status >= 400 && err.status < 500:
        // Erros 4xx (client errors)
        return 'Invalid credentials or request';

      case err.status >= 500:
        // Erros 5xx (server errors)
        return 'Server error, please try again later';

      default:
        return 'An unknown error occurred';
    }
  }

}
