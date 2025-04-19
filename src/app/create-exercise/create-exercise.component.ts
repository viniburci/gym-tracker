import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExerciseService } from './exercise.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-exercise',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-exercise.component.html',
  styleUrl: './create-exercise.component.css'
})
export class CreateExerciseComponent {
  private http = inject(HttpClient);
  private exerciseService = inject(ExerciseService);
  private router = inject(Router);

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required])
  });
  selectedFile: File | null = null;

  constructor() {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Arquivo selecionado:', this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('name', this.form.value.name!);
      formData.append('type', this.form.value.type!);
      formData.append('image', this.selectedFile);

      this.http.post('http://localhost:8080/exercises', formData)
        .subscribe({
          next: (response) => console.log('Exercício enviado com sucesso:', response),
          error: (error) => console.error('Erro ao enviar o exercício:', error)
        });
    } else {
      console.warn('Formulário inválido ou imagem não selecionada.');
    }
  }

}
