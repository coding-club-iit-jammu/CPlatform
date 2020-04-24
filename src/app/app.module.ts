import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
import { FirebaseServicesService } from './firebase-services.service';
import { TimeAPIClientService } from './services/time-apiclient.service';
import { HttpService } from './services/http/http.service';
import { ServerHandlerService } from './services/http/server-handler.service';
import { CoursehomeComponent } from './coursehome/coursehome.component';
import { FormatdatePipe } from './formatdate.pipe';
import { HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './spinner/spinner.component';
import { QuizComponent } from './quiz/quiz.component';
import { DetailsComponent } from './details/details.component';
import { HomeComponent } from './home/home.component';
import { IdeComponent } from './ide/ide.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTabsModule} from '@angular/material/tabs';

import { MaterialComponentService } from './services/material-component.service';

import { QuillModule } from 'ngx-quill';
import { QuestionsComponent } from './questions/questions.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CoursehomeComponent,
    FormatdatePipe,
    SpinnerComponent,
    QuizComponent,
    DetailsComponent,
    HomeComponent,
    IdeComponent,
    QuestionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatSnackBarModule,
    MatTabsModule,
    FormsModule,
    QuillModule.forRoot()
  ],
  providers: [
    FirebaseServicesService,
    TimeAPIClientService,
    HttpService,
    ServerHandlerService,
    MaterialComponentService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
