import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Workout } from '../workout.model';

@Component({
  selector: 'app-workout-item',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './workout-item.component.html',
  styleUrl: './workout-item.component.css'
})
export class WorkoutItemComponent {

  workout = input<Workout>();

  private router = inject(Router);

  navigateToWorkout(): void {
    if (this.workout()) {
      this.router.navigate(['/workouts', this.workout()!.id]);
    }
  }

}
