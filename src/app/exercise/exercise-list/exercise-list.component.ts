import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Exercise } from '../exercise.model';
import { ExerciseItemComponent } from '../exercise-item/exercise-item.component';
import { Router, RouterModule } from '@angular/router';
import { ExerciseService } from '../create-exercise/exercise.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [ ExerciseItemComponent, RouterModule, FormsModule],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.css'
})
export class ExerciseListComponent implements OnInit{

  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private cdr = inject(ChangeDetectorRef);

  exercises: Exercise[] = [
    { id: 1, name: 'Agachamento', type: 'Pernas', imageUrl: 'agachamento.jpg' },
    { id: 2, name: 'Supino', type: 'Peito', imageUrl: 'supino.jpg' },
    { id: 3, name: 'Rosca Direta', type: 'Braços', imageUrl: 'rosca.jpg' }
  ];

  searchTerm: string = '';
  selectedType: string = '';
  exerciseTypes: string[] = [...new Set(this.exercises.map(exercise => exercise.type))]; // Extraindo tipos únicos

  filteredExercises: Exercise[] = [...this.exercises];

  filterExercises(): void {
    this.filteredExercises = this.exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.selectedType === '' || exercise.type === this.selectedType)
    );
  }

  ngOnInit(): void {
    this.exerciseService.getExercises().subscribe((exercises: Exercise[]) => {
      this.exercises = exercises.map((exercise: Exercise) => {
        return {
          ...exercise,
          imageUrl: `http://localhost:8080/exercises/${exercise.id}/image`
        };
      });
      this.cdr.detectChanges();
    });
  }

  onView(id: number): void {
    console.log('View exercise with id:', id);
     this.router.navigate(['/exercises', id, 'view']);
  }
  onEdit(id: number): void {
    console.log('Edit exercise with id:', id);
    this.router.navigate(['/exercises/', id, 'edit']);
  }
  onDelete(id: number): void {
    console.log('Delete exercise with id:', id);
    this.exerciseService.deleteExercise(id).subscribe(() => {
      this.exercises = this.exercises.filter(exercise => exercise.id !== id);
      this.cdr.detectChanges();
      console.log('Exercise deleted successfully');
    });
  }
}
