import { Component, inject } from '@angular/core';
import { Workout } from '../workout.model';
import { WorkoutService } from '../workout.service';
import { RouterLink } from '@angular/router';
import { WorkoutItemComponent } from "../workout-item/workout-item.component";

@Component({
    selector: 'app-workout-list',
    imports: [RouterLink, WorkoutItemComponent],
    templateUrl: './workout-list.component.html',
    styleUrl: './workout-list.component.css'
})
export class WorkoutListComponent {
  workouts: Workout[] = [];
  loading = true;
  errorMessage = '';

  private workoutService = inject(WorkoutService);

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.workoutService.getUserWorkouts().subscribe({
      next: (data) => {
        this.workouts = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar workouts!';
        console.error(error);
        this.loading = false;
      },
    });
  }

  deleteWorkout(workoutId: number): void {
    this.workoutService.deleteWorkout(workoutId).subscribe(() => {
      this.workouts = this.workouts.filter(w => w.id !== workoutId);
    });
  }

}
