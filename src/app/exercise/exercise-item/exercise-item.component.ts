import { Component, input, output } from '@angular/core';
import { Exercise } from '../exercise.model';

@Component({
    selector: 'app-exercise-item',
    imports: [],
    templateUrl: './exercise-item.component.html',
    styleUrl: './exercise-item.component.css'
})
export class ExerciseItemComponent {

  exercise = input<Exercise>();
  view = output<number>();
  edit = output<number>();
  delete = output<number>();

  onView(): void {
    this.view.emit(this.exercise()!.id);
  }

  onEdit(): void {
    this.edit.emit(this.exercise()!.id);
  }

  onDelete(): void {
    this.delete.emit(this.exercise()!.id);
  }

}
