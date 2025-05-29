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
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';

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
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;
  isSubmitting = false;

  constructor() {}

  ngOnInit(): void {
    if (this.exerciseId() === undefined) {
      return;
    }

    this.isLoading = true;
    this.exerciseService.getExerciseById(+this.exerciseId()!).subscribe({
      next: (res) => {
        const exercise = res as { name: string; type: string };
        this.form.patchValue({
          name: exercise.name,
          type: exercise.type,
        });
        console.log('Exercício carregado com sucesso!');
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error);
      },
      complete: () => {
        this.loadExerciseImage();
      }
    });
  }

  private loadExerciseImage(): void {
    this.exerciseService.getExerciseImage(+this.exerciseId()!).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.imageSrc = objectURL;
        this.selectedFile = new File([blob], 'image.png', { type: blob.type });
        console.log('Imagem carregada com sucesso!');
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error);
      },
      complete: () => {
        this.isLoading = false;
      }
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

  private validateFile(file: File): string | null {
    // Check file size
    if (file.size > environment.maxImageSize) {
      return `Arquivo muito grande. Tamanho máximo: ${environment.maxImageSize / (1024 * 1024)}MB`;
    }

    // Check file type
    if (!environment.allowedImageTypes.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use: JPG ou PNG';
    }

    return null;
  }

  private handleFile(file: File) {
    this.errorMessage = null;
    const error = this.validateFile(file);
    
    if (error) {
      this.errorMessage = error;
      console.error(error);
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
    };
    reader.onerror = () => {
      this.errorMessage = 'Erro ao ler o arquivo. Tente novamente.';
      this.selectedFile = null;
      this.imageSrc = null;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imageSrc = null;
    this.form.markAsTouched();
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;
    
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
    this.form.markAsTouched();

    if (!this.form.valid || !this.selectedFile) {
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('name', this.form.value.name!);
    formData.append('type', this.form.value.type!);
    formData.append('image', this.selectedFile);

    if (this.exerciseId() !== null && !isNaN(+this.exerciseId()!)) {
      this.exerciseService.updateExercise(+this.exerciseId()!, formData)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => {
            this.successMessage = 'Exercício atualizado com sucesso!';
            setTimeout(() => this.router.navigate(['/exercises']), 1500);
          },
          error: (error) => {
            this.errorMessage = error.message;
            console.error('Erro ao atualizar o exercício:', error);
          },
        });
      return;
    }

    this.exerciseService.postExercise(formData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Exercício criado com sucesso!';
          setTimeout(() => this.router.navigate(['/exercises']), 1500);
        },
        error: (error) => {
          this.errorMessage = error.message;
          console.error('Erro ao enviar o exercício:', error);
        },
      });
  }
}
