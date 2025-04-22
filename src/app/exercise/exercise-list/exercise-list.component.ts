import { Component, inject } from '@angular/core';
import { Exercise } from '../exercise.model';
import { ExerciseItemComponent } from '../exercise-item/exercise-item.component';
import { Router, RouterModule } from '@angular/router';
import { ExerciseService } from '../create-exercise/exercise.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [ ExerciseItemComponent, RouterModule],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.css'
})
export class ExerciseListComponent {

  private router = inject(Router);
  private exerciseService = inject(ExerciseService);

  exercises: Exercise[] = [
    { id: 1, name: 'Agachamento', type: 'Pernas', imageUrl: 'agachamento.jpg' },
    { id: 2, name: 'Supino', type: 'Peito', imageUrl: 'supino.jpg' },
    { id: 3, name: 'Rosca Direta', type: 'Braços', imageUrl: 'rosca.jpg' }
  ];

  onView(id: number): void {
    console.log('View exercise with id:', id);
     this.router.navigate(['/exercise', id]);
    // Or you can show a modal with exercise details
    // this.modalService.open(ExerciseDetailComponent, { data: { id } });
    // this.exerciseService.getExerciseById(id).subscribe(exercise => {
    //   this.selectedExercise = exercise;
    //   this.modalService.open(ExerciseDetailComponent, { data: { exercise } });
    // });
  }
  onEdit(id: number): void {
    console.log('Edit exercise with id:', id);
    // Implement edit logic here
    // For example, you can navigate to the edit page with the exercise id
    this.router.navigate(['/exercise/edit', id]);
    // Or you can open a modal with the exercise form pre-filled
    // this.exerciseService.getExerciseById(id).subscribe(exercise => {
    //   this.selectedExercise = exercise;
    //   this.modalService.open(ExerciseFormComponent, { data: { exercise } });
    // });
  }
  onDelete(id: number): void {
    console.log('Delete exercise with id:', id);
    // Implement delete logic here
    // For example, you can filter out the exercise with the given id from the exercises array
    this.exercises = this.exercises.filter(exercise => exercise.id !== id);
    // You can also call a service to delete the exercise from the backend if needed
    // this.exerciseService.deleteExercise(id).subscribe(() => {
    //   this.exercises = this.exercises.filter(exercise => exercise.id !== id);
    // });
  }
}
