import { Component, inject } from '@angular/core';
import { Exercise } from './exercise.model';
import { ActivatedRoute } from '@angular/router';
import { ExerciseService } from './create-exercise/exercise.service';

@Component({
    selector: 'app-exercise',
    imports: [],
    templateUrl: './exercise.component.html',
    styleUrl: './exercise.component.css'
})
export class ExerciseComponent {
  private route = inject(ActivatedRoute);
  private exerciseService = inject(ExerciseService);

  exerciseId: number | null = null;
  exercise: Exercise | null = null;
  imageSrc: string | null = null;

  ngOnInit(): void {
    this.exerciseId = Number(this.route.snapshot.paramMap.get('exerciseId'));

    if (isNaN(this.exerciseId)) {
      console.error('ID do exercício inválido!');
      return;
    }

    this.loadExerciseData();
  }

  private loadExerciseData(): void {
    this.exerciseService.getExerciseById(this.exerciseId!).subscribe({
      next: (res) => {
        this.exercise = res;
        console.log('Exercício carregado:', this.exercise);
      },
      error: (err) => console.error('Erro ao carregar exercício:', err),
    });

    this.exerciseService.getExerciseImage(this.exerciseId!).subscribe({
      next: (blob) => {
        this.imageSrc = URL.createObjectURL(blob);
        console.log('Imagem carregada');
      },
      error: (err) => console.error('Erro ao carregar imagem:', err),
    });
  }

  goBack(): void {
    history.back();
  }
}
