import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CoursehomeComponent } from './coursehome/coursehome.component';
import { DetailsComponent } from './details/details.component';
import { QuizComponent } from './quiz/quiz.component'
import { IdeComponent } from './ide/ide.component';
import { QuestionsComponent } from './questions/questions.component';
import { PracticeComponent } from './practice/practice.component';
import { CreateTestComponent } from './test-settings/create-test.component';
import { TestReportComponent } from './test-report/test-report.component';
import { TestStatisticsComponent } from './test-statistics/test-statistics.component';
import { ResetComponent } from './reset/reset.component';
import { VerifyComponent } from './verify/verify.component';

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
    path: 'reset/:_id/:token',
    component: ResetComponent
  },
  {
    path: 'verify/:_id/:token',
    component: VerifyComponent
  },
  {
    path:'course/:courseId/questions',
    component: QuestionsComponent
  },
  {
    path:'course/:courseId/practice',
    component: PracticeComponent
  },
  {
    path:'course/:courseId/tests/:testId/settings',
    component: CreateTestComponent
  },
  {
    path:'course/:courseId/tests/:testId/stats',
    component: TestStatisticsComponent
  },
  {
    path:'course/:courseId/tests/:testId/report',
    component: TestReportComponent
  },
  {
    path: 'course/:courseId/:view',
    component: CoursehomeComponent
  },
  {
    path: 'course/:courseId',
    component: CoursehomeComponent
  },
  {
    path: 'signup',
    component: DetailsComponent
  },
  {
    path: 'course/:courseId/test/:testId/:groupId',
    component: QuizComponent
  },
  {
    path: 'ide',
    component: IdeComponent
  },
  {
    path: '**', 
    redirectTo: 'home' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
