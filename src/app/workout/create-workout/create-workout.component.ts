import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { Workout, WorkoutExercise } from '../workout.model';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExerciseService } from '../../exercise/create-exercise/exercise.service';
import { Exercise } from '../../exercise/exercise.model';
import { WorkoutService } from '../workout.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: 'app-create-workout',
    imports: [ReactiveFormsModule, FormsModule, DragDropModule],
    templateUrl: './create-workout.component.html',
    styleUrl: './create-workout.component.css'
})
export class CreateWorkoutComponent implements OnInit {

  editing: boolean = false;
  originalWorkout: Workout | null = null;
  isLoading = signal(false);

  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = this.exercises;
  selectedExercises = signal<WorkoutExercise[]>([]);
  exerciseTypes: string[] = []

  selectedExercisesCount = computed(() => this.selectedExercises().length);

  hasExercises = computed(() => this.selectedExercises().length > 0);

  canSaveWorkout = computed(() => {
    const exercises = this.selectedExercises();
    const hasValidName = this.workoutForm.get('name')?.valid;

    // No modo edição: pode salvar apenas se houver mudanças
    if (this.editing && this.originalWorkout) {
      const hasChanges = this.hasWorkoutChanges();
      return hasValidName && exercises.length > 0 && hasChanges;
    }

    return hasValidName && exercises.length > 0;
  });

  private hasWorkoutChanges(): boolean {
    if (!this.originalWorkout) {
      return false;
    }

    const currentName = this.workoutForm.get('name')?.value;
    const currentExercises = this.selectedExercises();

    // Verificar se o nome mudou
    if (currentName !== this.originalWorkout.name) {
      return true;
    }

    // Verificar se a quantidade de exercícios mudou
    if (currentExercises.length !== this.originalWorkout.workoutExercises.length) {
      return true;
    }

    // Verificar se algum exercício mudou (sets, reps, posição)
    for (let i = 0; i < currentExercises.length; i++) {
      const current = currentExercises[i];
      const original = this.originalWorkout.workoutExercises[i];

      if (!original) {
        return true; // Novo exercício adicionado
      }

      if (current.exercise.id !== original.exercise.id ||
          current.sets !== original.sets ||
          current.reps !== original.reps ||
          current.position !== original.position) {
        return true;
      }
    }

    return false;
  }

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

    if(this.router.url.includes('edit')) {
      this.editing = true;
      const workoutId = this.route.snapshot.paramMap.get('workoutId');
      if (workoutId) {
        this.workoutService.getWorkoutById(+workoutId).subscribe((workout: Workout) => {
          this.workoutForm.patchValue({
            name: workout.name,
          });

          // Ordenar exercícios por position antes de definir no signal
          const sortedExercises = (workout.workoutExercises || []).sort((a, b) => a.position - b.position);
          this.selectedExercises.set(sortedExercises);

          // Salvar o workout original para comparação
          this.originalWorkout = {
            ...workout,
            workoutExercises: sortedExercises
          };
        });
      }
    }

    // Monitorar mudanças no tipo de exercício selecionado
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
    const sets = this.workoutForm.get('sets')?.value ?? 1;
    const reps = this.workoutForm.get('reps')?.value ?? 1;

    const position = this.selectedExercises().length;

    this.workoutForm.get('position')?.setValue(position);
    this.workoutForm.get('position')?.updateValueAndValidity();
    this.workoutForm.updateValueAndValidity();

    if (!exerciseId) return;

    const selectedExercise = this.exercises.find(ex => ex.id === (+exerciseId));
    if (!selectedExercise) return;

    // Usando signal para atualizar a lista
    this.selectedExercises.update(exercises => [
      ...exercises,
      {
        exercise: {id: +exerciseId},
        sets: sets,
        reps: reps,
        position: position,
      }
    ]);
  }

  removeExercise(we: WorkoutExercise) {
    this.selectedExercises.update(exercises =>
      exercises.filter(exercise => exercise !== we)
    );
  }

  submitWorkout(): void {
    // No modo edição, só precisamos verificar se há exercícios e se o nome é válido
    const hasValidName = this.workoutForm.get('name')?.valid;
    const hasExercises = this.selectedExercises().length > 0;

    if (hasValidName && hasExercises) {
      this.isLoading.set(true);

      // Preparar os exercícios preservando IDs quando possível
      const workoutExercises = this.selectedExercises().map((exercise, index) => {
        // Se estamos editando e o exercício já existia na mesma posição, preservar o ID
        if (this.editing && this.originalWorkout && this.originalWorkout.workoutExercises[index]) {
          const originalExercise = this.originalWorkout.workoutExercises[index];
          // Se é o mesmo exercício (mesmo ID), preservar o ID do WorkoutExercise
          if (originalExercise.exercise.id === exercise.exercise.id) {
            return {
              ...exercise,
              id: originalExercise.id
            };
          }
        }
        return exercise;
      });

      const workout: Workout = {
        name: this.workoutForm.get('name')?.value ?? '',
        workoutExercises: workoutExercises,
      };

      if (this.editing) {
        // Modo edit - atualizar workout existente
        const workoutId = this.route.snapshot.paramMap.get('workoutId');
        if (workoutId) {
          this.workoutService.updateWorkout(+workoutId, workout).subscribe({
            next: () => {
              console.log('Treino atualizado com sucesso!');
              this.isLoading.set(false);
              this.router.navigate(['/workouts']);
            },
            error: (error) => {
              console.error('Erro ao atualizar treino:', error);
              this.isLoading.set(false);
            }
          });
        }
      } else {
        // Modo create - criar novo workout
        this.workoutService.createWorkout(workout).subscribe({
          next: () => {
            console.log('Treino criado com sucesso!');
            this.isLoading.set(false);
            this.workoutForm.reset();
            this.selectedExercises.set([]);
          },
          error: (error) => {
            console.error('Erro ao criar treino:', error);
            this.isLoading.set(false);
          }
        });
      }
    } else {
      if (!hasValidName) {
        console.warn('Nome do treino é obrigatório!');
      }
      if (!hasExercises) {
        console.warn('Adicione pelo menos um exercício!');
      }
    }
  }

  drop(event: CdkDragDrop<{title: string; poster: string}[]>) {
    // Usando signal para atualizar a lista após drag and drop
    this.selectedExercises.update(exercises => {
      const newExercises = [...exercises];
      moveItemInArray(newExercises, event.previousIndex, event.currentIndex);

      // Atualizar posições e retornar nova array com posições corretas
      return newExercises.map((exercise, index) => ({
        ...exercise,
        position: index
      }));
    });
  }

  updateExerciseReps(id: number, position: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = Number(input.value);

    if (isNaN(newValue) || newValue < 1) {
      input.value = '1';
      return;
    }

    // Usando signal para atualizar reps
    this.selectedExercises.update(workoutExercises =>
      workoutExercises.map(workoutExercise =>
        workoutExercise.exercise.id === id && workoutExercise.position === position
          ? { ...workoutExercise, reps: newValue }
          : workoutExercise
      )
    );
  }

  updateExerciseSets(id: number, position: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = Number(input.value);

    if (isNaN(newValue) || newValue < 1) {
      input.value = '1';
      return;
    }

    // Usando signal para atualizar sets
    this.selectedExercises.update(workoutExercises =>
      workoutExercises.map(workoutExercise =>
        workoutExercise.exercise.id === id && workoutExercise.position === position
          ? { ...workoutExercise, sets: newValue }
          : workoutExercise
      )
    );
  }

}
