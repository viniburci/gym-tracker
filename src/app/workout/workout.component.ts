import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Workout } from './workout.model';
import { WorkoutService } from './workout.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-workout',
    imports: [],
    templateUrl: './workout.component.html',
    styleUrl: './workout.component.css'
})
export class WorkoutComponent implements OnInit {

  private workoutService = inject(WorkoutService);
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

}
