import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { CreateExerciseComponent } from './exercise/create-exercise/create-exercise.component';
import { ExerciseListComponent } from './exercise/exercise-list/exercise-list.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { CreateWorkoutComponent } from './workout/create-workout/create-workout.component';
import { WorkoutListComponent } from './workout/workout-list/workout-list.component';
import { WorkoutComponent } from './workout/workout.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'profile',
    component: UserProfileComponent
  },
  {
    path: 'exercises',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ExerciseListComponent },
      { path: ':exerciseId/view', component: ExerciseComponent },
      { path: ':exerciseId/edit', component: CreateExerciseComponent },
      { path: 'new', component: CreateExerciseComponent }
    ]
  },
  {
    path: 'workouts',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: WorkoutListComponent },
      { path: 'new', component: CreateWorkoutComponent},
      { path: ':workoutId/view', component: WorkoutComponent},
      { path: ':workoutId/edit', component: CreateWorkoutComponent}
    ]
  }
];
