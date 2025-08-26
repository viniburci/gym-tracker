import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Exercise } from '../exercise.model';
import { ExerciseItemComponent } from '../exercise-item/exercise-item.component';
import { Router, RouterModule } from '@angular/router';
import { ExerciseService } from '../create-exercise/exercise.service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CapitalizePipe } from "../../core/pipes/capitalize.pipe";

@Component({
    selector: 'app-exercise-list',
    imports: [ExerciseItemComponent, RouterModule, FormsModule, CapitalizePipe],
    templateUrl: './exercise-list.component.html',
    styleUrl: './exercise-list.component.css'
})
export class ExerciseListComponent implements OnInit {
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  exerciseTypes: string[] = [];
  searchTerm = '';
  selectedType = '';

  filterExercises(): void {
    this.filteredExercises = this.exercises.filter(
      (exercise) =>
        (exercise.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) &&
        (this.selectedType === '' || exercise.type === this.selectedType)
    );
    console.log('Exercícios filtrados:', this.filteredExercises);
  }

  ngOnInit(): void {
    this.exerciseService.getExercises().subscribe((exercises: Exercise[]) => {
      this.exercises = exercises;

      // Load images for each exercise
      this.exercises.forEach(exercise => {
        this.exerciseService.getExerciseImage(exercise.id).subscribe({
          next: (blob) => {
            const objectUrl = URL.createObjectURL(blob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
            exercise.imageUrl = safeUrl;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error(`Error loading image for exercise ${exercise.id}:`, error);
            exercise.imageUrl = 'assets/placeholder-image.png'; // Add a placeholder image
            this.cdr.detectChanges();
          }
        });
      });

      this.exerciseTypes = [
        ...new Set(this.exercises.map((exercise) => exercise.type).filter((type): type is string => type !== undefined)),
      ];
      this.filteredExercises = [...this.exercises];
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
      this.exercises = this.exercises.filter((exercise) => exercise.id !== id);
      this.filterExercises();
      this.cdr.detectChanges();
      console.log('Exercise deleted successfully');
    });
  }
}
