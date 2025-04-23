import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExerciseService } from './exercise.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-exercise',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-exercise.component.html',
  styleUrl: './create-exercise.component.css',
})
export class CreateExerciseComponent implements OnInit {
  private exerciseService = inject(ExerciseService);
  private router = inject(Router);

  exerciseId = input<number>();

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
  });
  selectedFile: File | null = null;

  imageSrc: string | null = null;

  constructor() {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    console.log(this.exerciseId());
    console.log('exerciseId:', this.exerciseId());
    if (this.exerciseId() === undefined) {
      return;
    }
    this.exerciseService.getExerciseById(+this.exerciseId()!).subscribe({
      next: (res) => {
        const exercise = res as { name: string; type: string };
        this.form.patchValue({
          name: exercise.name,
          type: exercise.type,
        });
        console.log('Exercício carregado com sucesso!');
      },
      error: (err) => console.log(err),
    });
    this.exerciseService.getExerciseImage(+this.exerciseId()!).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.imageSrc = objectURL;
        this.selectedFile = new File([blob], 'image.png', { type: blob.type });
        console.log('Imagem carregada:', this.imageSrc);
        console.log('Imagem carregada com sucesso!');
      },
      error: (err) => console.error(err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Arquivo selecionado:', this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.exerciseId() !== null && !isNaN(+this.exerciseId()!)) {
      if (this.form.valid && this.selectedFile) {
        const formData = new FormData();
        formData.append('name', this.form.value.name!);
        formData.append('type', this.form.value.type!);
        formData.append('image', this.selectedFile);

        this.exerciseService.updateExercise(+this.exerciseId()!, formData).subscribe({
          next: (response) => console.log('Exercício atualizado com sucesso:', response),
          error: (error) => console.error('Erro ao atualizar o exercício:', error),
        });
      } else {
        console.warn('Formulário inválido ou imagem não selecionada.');
      }
      return;
    }

    if (this.form.valid && this.selectedFile !== null && this.selectedFile.size > 0) {
      const formData = new FormData();
      formData.append('name', this.form.value.name!);
      formData.append('type', this.form.value.type!);
      formData.append('image', this.selectedFile);

      this.exerciseService.postExercise(formData).subscribe({
        next: (response) => console.log('Exercício enviado com sucesso:', response),
        error: (error) => console.error('Erro ao enviar o exercício:', error),
      });
    } else {
      console.warn('Formulário inválido ou imagem não selecionada.');
    }
  }

  getExercise() {
    this.exerciseService.getExerciseById(1).subscribe({
      next: (res) => console.log(res),
      error: (err) => console.log(err),
    });
  }

  getImage() {
    this.exerciseService.getExerciseImage(1).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.imageSrc = objectURL;
        console.log('Imagem carregada com sucesso!');
      },
      error: (err) => console.error(err),
    });
  }
}
