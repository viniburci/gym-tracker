import { Component, inject, input, OnInit } from '@angular/core';
import { Workout } from './workout.model';
import { WorkoutService } from './workout.service';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css'
})
export class WorkoutComponent implements OnInit {

  private workoutService = inject(WorkoutService);

  workoutId = input<string>('workoutId');

  workout: Workout | undefined;

  ngOnInit(): void {
    this.workoutService.getWorkoutById(+this.workoutId).subscribe((workout: Workout) => {
      this.workout = workout;
    });
    console.log('Workout ID:', this.workoutId);
    console.log('Workout:', this.workout);
  }


}
