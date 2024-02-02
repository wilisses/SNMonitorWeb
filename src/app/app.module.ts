import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AuthComponent } from './auth/auth.component';
import { AuthService } from './service/auth.service';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { AppComponent } from './app.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RegisterComponent } from './register/register.component';
import { MatSelectModule } from '@angular/material/select';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatIconModule} from '@angular/material/icon';
import { ConfigDialogComponent } from './shared/components/config-dialog/config-dialog.component';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogTitle} from '@angular/material/dialog';
import { NewDataBaseDialogComponent } from './shared/components/new-data-base-dialog/new-data-base-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PendingDialogComponent } from './shared/components/pending-dialog/pending-dialog.component';
import { UserComponent } from './user/user.component';
import {MatMenuModule} from '@angular/material/menu';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { HttpClientModule } from '@angular/common/http';
import { LicenseDialogComponent } from './shared/components/license-dialog/license-dialog.component';

@NgModule({
  declarations: [
    AuthComponent,
    MonitoringComponent,
    AppComponent,
    RegisterComponent,
    ConfigDialogComponent,
    NewDataBaseDialogComponent,
    PendingDialogComponent,
    UserComponent,
    LicenseDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp({
        apiKey: "AIzaSyB0cOk8DDfrFegMYJ0UjQsIRmEVXutdOiw",
        authDomain: "backupplus-monitoring.firebaseapp.com",
        databaseURL: "https://backupplus-monitoring-default-rtdb.firebaseio.com",
        projectId: "backupplus-monitoring",
        storageBucket: "backupplus-monitoring.appspot.com",
        messagingSenderId: "102506778320",
        appId: "1:102506778320:web:162ddb6dfeba02a51058d5"
    }),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatSelectModule,
    TextFieldModule, 
    MatButtonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatIconModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatSnackBarModule,
    MatMenuModule,
    NgxMaskDirective,
    NgxMaskPipe,
    HttpClientModule,
  ],
  providers: [AuthService, provideNgxMask()],
  bootstrap: [AppComponent],

})
export class AppModule { }
