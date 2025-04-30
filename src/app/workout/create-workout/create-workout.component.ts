import { Component, inject, OnInit, signal } from '@angular/core';
import { Workout, WorkoutExercise } from '../workout.model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExerciseService } from '../../exercise/create-exercise/exercise.service';
import { Exercise } from '../../exercise/exercise.model';
import { WorkoutService } from '../workout.service';

@Component({
  selector: 'app-create-workout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
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
  });

  ngOnInit(): void {
    this.loadExercises();
    this.workoutForm.get('exerciseType')?.valueChanges.subscribe(value => {
      this.filterExercises();
    });
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.exercises.find(e => e.id === Number(exerciseId));
    return exercise ? exercise.name : 'Exercício não encontrado';
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises = exercises;
      this.exerciseTypes = [...new Set(exercises.map((exercise) => exercise.type))];

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
    console.log("adding exercise")
    const exerciseId = this.workoutForm.get('exerciseId')?.value;
    console.log("exerciseID: " + exerciseId)
    const sets = this.workoutForm.get('sets')?.value;
    const reps = this.workoutForm.get('reps')?.value;

    if (!exerciseId) return;

    console.log('Lista de Exercícios:', this.exercises);
    console.log('ID buscado:', exerciseId);

    const selectedExercise = this.exercises.find(ex => ex.id === (+exerciseId));
    console.log("selectedExercise: " + selectedExercise)
    if (!selectedExercise) return;
    console.log("after return 2")

    this.selectedExercises = [...this.selectedExercises, {
      exercise: {id: +exerciseId},
      sets: sets ?? 1,
      reps: reps ?? 1
    }];
    console.log(this.selectedExercises)
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
}
