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
  errorMessage = this.auth.errorMessage;

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
        error: () => this.isLoading.set(false)
      })
    }
  }
}
