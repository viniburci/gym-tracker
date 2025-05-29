import { Component, inject, input, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExerciseService } from './exercise.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-create-exercise',
    standalone: true,
    imports: [
      ReactiveFormsModule,
      CommonModule,
      MatIconModule
    ],
    templateUrl: './create-exercise.component.html',
    styleUrl: './create-exercise.component.css'
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
  isDragging = false;

  constructor() {}

  ngOnInit(): void {
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

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    if (file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('Por favor, selecione apenas arquivos de imagem.');
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imageSrc = null;
    this.form.markAsTouched();
  }

  onSubmit(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
    this.form.markAsTouched();

    if (this.exerciseId() !== null && !isNaN(+this.exerciseId()!)) {
      if (this.form.valid && this.selectedFile) {
        const formData = new FormData();
        formData.append('name', this.form.value.name!);
        formData.append('type', this.form.value.type!);
        formData.append('image', this.selectedFile);

        this.exerciseService.updateExercise(+this.exerciseId()!, formData).subscribe({
          next: (response) => {
            console.log('Exercício atualizado com sucesso:', response);
            this.router.navigate(['/exercises']);
          },
          error: (error) => console.error('Erro ao atualizar o exercício:', error),
        });
      }
      return;
    }

    if (this.form.valid && this.selectedFile !== null && this.selectedFile.size > 0) {
      const formData = new FormData();
      formData.append('name', this.form.value.name!);
      formData.append('type', this.form.value.type!);
      formData.append('image', this.selectedFile);

      this.exerciseService.postExercise(formData).subscribe({
        next: (response) => {
          console.log('Exercício enviado com sucesso:', response);
          this.router.navigate(['/exercises']);
        },
        error: (error) => console.error('Erro ao enviar o exercício:', error),
      });
    }
  }
}
