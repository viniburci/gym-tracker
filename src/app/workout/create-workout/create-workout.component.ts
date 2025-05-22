import { Component, inject, OnInit, signal } from '@angular/core';
import { Workout, WorkoutExercise } from '../workout.model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExerciseService } from '../../exercise/create-exercise/exercise.service';
import { Exercise } from '../../exercise/exercise.model';
import { WorkoutService } from '../workout.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-create-workout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DragDropModule],
  templateUrl: './create-workout.component.html',
  styleUrl: './create-workout.component.css',
})
export class CreateWorkoutComponent implements OnInit {

  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);

  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = this.exercises;
  selectedExercises: WorkoutExercise[] = [];
  exerciseTypes: string[] = []

  workoutForm = new FormGroup({
    name: new FormControl('', Validators.required),
    exerciseType: new FormControl(''),
    exerciseId: new FormControl(null, Validators.required),
    sets: new FormControl(1, [Validators.required, Validators.min(1)]),
    reps: new FormControl(1, [Validators.required, Validators.min(1)]),
    position: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  ngOnInit(): void {
    this.loadExercises();
    this.workoutForm.get('exerciseType')?.valueChanges.subscribe(value => {
      this.filterExercises();
    });
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.exercises.find(e => e.id === Number(exerciseId));
    return exercise ? exercise.name ?? 'Nome não disponível' : 'Exercício não encontrado';
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises = exercises;
      this.exerciseTypes = [...new Set(exercises.map((exercise) => exercise.type).filter((type): type is string => type !== undefined))];

      this.filteredExercises = [...this.exercises];
    });
  }

  filterExercises(): void {
    const selectedType = this.workoutForm.get('exerciseType')?.value;

    if (!selectedType) {
      this.filteredExercises = [...this.exercises];
    } else {
      this.filteredExercises = this.exercises.filter(exercise => exercise.type === selectedType);
    }
  }

  addExercise(): void {
    const exerciseId = this.workoutForm.get('exerciseId')?.value;
    console.log("exerciseID: " + exerciseId)
    const sets = this.workoutForm.get('sets')?.value ?? 1;
    const reps = this.workoutForm.get('reps')?.value ?? 1;

    const position = this.selectedExercises.length;

    this.workoutForm.get('position')?.setValue(position);
    this.workoutForm.get('position')?.updateValueAndValidity();
    this.workoutForm.updateValueAndValidity();

    if (!exerciseId) return;

    console.log('Lista de Exercícios:', this.exercises);

    const selectedExercise = this.exercises.find(ex => ex.id === (+exerciseId));
    console.log("selectedExercise: " + JSON.stringify(selectedExercise, null, 2));
    if (!selectedExercise) return;

    this.selectedExercises = [
      ...this.selectedExercises,
      {
        exercise: {id: +exerciseId},
        sets: sets,
        reps: reps,
        position: position,
      }
    ];

    console.log(this.selectedExercises);
    console.log("Status do Formulário:", this.workoutForm.valid);
    console.log("Erros no Formulário:", this.workoutForm.errors);
    console.log("Erros nos controles:", this.workoutForm.controls);
  }

  removeExercise(we: WorkoutExercise) {
    const index = this.selectedExercises.indexOf(we);
    if (index > -1) {
      this.selectedExercises.splice(index, 1);
    }
  }

  submitWorkout(): void {
    if (this.workoutForm.valid && this.selectedExercises.length > 0) {
      const workout: Workout = {
        name: this.workoutForm.get('name')?.value ?? '',
        workoutExercises: this.selectedExercises,
      };

      console.log(workout)

      this.workoutService.createWorkout(workout).subscribe(() => {
        console.log('Treino criado com sucesso!');
        this.workoutForm.reset();
        this.selectedExercises = [];
      });
    } else {
      console.warn('Preencha os dados corretamente!');
    }
  }

  drop(event: CdkDragDrop<{title: string; poster: string}[]>) {
    moveItemInArray(this.selectedExercises, event.previousIndex, event.currentIndex);
  }
}
