import { Component, inject, OnInit } from '@angular/core';
import { Workout, WorkoutExercise } from '../workout.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExerciseService } from '../../exercise/create-exercise/exercise.service';
import { Exercise } from '../../exercise/exercise.model';
import { WorkoutService } from '../workout.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-create-workout',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-workout.component.html',
  styleUrl: './create-workout.component.css',
})
export class CreateWorkoutComponent implements OnInit {

  exercises: Exercise[] = [];
  selectedExercises: WorkoutExercise[] = [];

  exerciseTypes: string[] = [...new Set(this.exercises.map((exercise) => exercise.type))];;

  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);

  constructor() {}

  workoutForm = new FormGroup({
    name: new FormControl('', Validators.required),
    exerciseId: new FormControl(null, Validators.required),
    sets: new FormControl(1, [Validators.required, Validators.min(1)]),
    reps: new FormControl(1, [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.loadExercises();
    console.log(this.exerciseTypes)
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.exercises.find(e => e.id === Number(exerciseId));
    return exercise ? exercise.name : 'Exercício não encontrado';
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises = exercises;
    });
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
      exerciseId,
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
