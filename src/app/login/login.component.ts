import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { LoadingSpinner } from '../../public/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinner],
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
      this.auth.signup(email, password).subscribe({
        next: response => {console.log(response); this.isLoading.set(false)},
        error: err => {console.log(err); this.isLoading.set(false); this.errorMessage.set(err)},
      });
    }
  }

}
