import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  private auth = inject(AuthService);
  isLoading = signal(false);
  errorMessage = signal('');

  form = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('USER', [])
  })

  get firstNameIsInvalid() {
    return (
      this.form.controls.firstname.touched &&
      this.form.controls.firstname.dirty &&
      this.form.controls.firstname.invalid
    )
  }

  get lastNameIsInvalid() {
    return (
      this.form.controls.lastname.touched &&
      this.form.controls.lastname.dirty &&
      this.form.controls.lastname.invalid
    )
  }

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

  get repeatPasswordIsInvalid() {
    return (
      this.form.controls.confirmPassword.touched &&
      this.form.controls.confirmPassword.dirty &&
      this.form.controls.confirmPassword.value !== this.form.controls.password.value
    )
  }

  onSubmit() {
    const firstname = this.form.controls.firstname.value;
    const lastname = this.form.controls.lastname.value;
    const email = this.form.controls.email.value;
    const password = this.form.controls.password.value;
    const repeatPassword = this.form.controls.confirmPassword.value;
    const role = this.form.controls.role.value;
    console.log(email, password, repeatPassword);

    if(firstname && lastname && email && password && role) {
      this.isLoading.set(true);
      this.auth.register(firstname, lastname, email, password, role).subscribe({
        next: (response) => {console.log(response); this.isLoading.set(false)},
        error: err => {console.log(err); this.isLoading.set(false); this.errorMessage.set(this.getErrorMessage(err))}
      })
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
