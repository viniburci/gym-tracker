import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Workout } from './workout.model';
import { WorkoutService } from './workout.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-workout',
    imports: [RouterLink],
    templateUrl: './workout.component.html',
    styleUrl: './workout.component.css'
})
export class WorkoutComponent implements OnInit {

  private workoutService = inject(WorkoutService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  workout = signal<Workout | null>(null);

  ngOnInit(): void {
    const workoutId = this.route.snapshot.paramMap.get('workoutId');
    if (workoutId) {
      this.workoutService.getWorkoutById(+workoutId).subscribe((workout: Workout) => {
        this.workout.set(workout);
        if (workout.workoutExercises) {
          //ordena os exercicios de forma crescente conforme o valor da position
          workout.workoutExercises.sort((a, b) => a.position - b.position);
        }
      });
    }
  }

  deleteWorkout(workoutId: number | undefined) {
    const confirmed = window.confirm('Tem certeza que deseja excluir este treino?');

    if (confirmed && workoutId) {
      this.workoutService.deleteWorkout(workoutId).subscribe({
        next: () => {
          this.router.navigate(['/workouts']);
        },
        error: (error) => {
          if (error.status === 403) {
            alert('Você não tem permissão para excluir este treino.');
          } else if (error.status === 404) {
            alert('Treino não encontrado. Ele pode já ter sido excluído.');
          } else if (error.status === 500) {
            alert('Erro interno no servidor. Tente novamente mais tarde.');
          } else {
            alert('Ocorreu um erro inesperado. Verifique sua conexão ou tente novamente.');
          }

          console.error('Erro ao excluir treino:', error);
        }
      });
    }
  }

}
