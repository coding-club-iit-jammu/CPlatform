import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CoursehomeComponent } from './coursehome/coursehome.component';
import { DetailsComponent } from './details/details.component';
import { QuizComponent } from './quiz/quiz.component'

const routes: Routes = [
  {
    path:"",
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'course',
    component: CoursehomeComponent
  },
  {
    path: 'signup',
    component: DetailsComponent
  },
  {
    path: 'quiz',
    component: QuizComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
