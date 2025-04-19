import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExerciseService } from './exercise.service';

@Component({
  selector: 'app-create-exercise',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-exercise.component.html',
  styleUrl: './create-exercise.component.css'
})
export class CreateExerciseComponent {

  private exerciseService = inject(ExerciseService);

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required])
  });
  selectedFile: File | null = null;
  imageBase64: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
        console.log('Imagem em Base64:', this.imageBase64);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.imageBase64) {
      const exercise = {
        name: this.form.value.name,
        type: this.form.value.type,
        image: this.imageBase64
      };

      console.log('Dados enviados:', exercise);

      // Exemplo: this.http.post('URL_DO_SERVICO', exercise).subscribe();
    } else {
      console.warn('Formulário inválido ou imagem não selecionada.');
    }
  }

}
