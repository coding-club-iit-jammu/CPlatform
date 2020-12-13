import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule }   from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { CoursehomeComponent } from './coursehome/coursehome.component';
import { HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './spinner/spinner.component';
import { QuizComponent } from './quiz/quiz.component';
import { DetailsComponent } from './details/details.component';
import { HomeComponent } from './home/home.component';
import { IdeComponent } from './ide/ide.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { HttpService } from './services/http/http.service';
import { ServerHandlerService } from './services/http/server-handler.service';
import { MaterialComponentService } from './services/material-component.service';
import { TokenInterceptorService } from './services/token-interceptor.service';

import { QuillModule } from 'ngx-quill';

import { QuestionsComponent } from './questions/questions.component';
import { PracticeComponent } from './practice/practice.component';
import { CreateTestComponent } from './test-settings/create-test.component';
import { TestReportComponent } from './test-report/test-report.component';
import { TestStatisticsComponent } from './test-statistics/test-statistics.component';
import { ResetComponent } from './reset/reset.component';
import { VerifyComponent } from './verify/verify.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CoursehomeComponent,
    SpinnerComponent,
    QuizComponent,
    DetailsComponent,
    HomeComponent,
    IdeComponent,
    QuestionsComponent,
    PracticeComponent,
    CreateTestComponent,
    TestReportComponent,
    TestStatisticsComponent,
    ResetComponent,
    VerifyComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    MatSidenavModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    QuillModule.forRoot({
      modules: {
        syntax: true,
        toolbar: [['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
     
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
     
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
     
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
     
        ['clean'],                                         // remove formatting button
     
        ['link', 'formula']
      ]
      }
    })
  ],
  providers: [
    MaterialComponentService,
    HttpService,
    ServerHandlerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
