import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StatisticsComponent } from './statistics/statistics.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { routes } from './app.routes';
import { CommonModule } from '@angular/common'; 
import { ApiService } from './services/api.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ProfileModule } from './features/profile/profile.module';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from './features/auth/auth.component';
import { MapComponent } from './features/map/map.component';
import { ProfileComponent } from './features/profile/profile.component';
import { HeaderComponent } from './components/header/header.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown'; 



@NgModule({
  //  HeaderComponent standalone olduğu için buradan kaldırıldı
  imports: [
    BrowserModule,
    CommonModule, // 
    HttpClientModule, // 
    FormsModule,
    StatisticsComponent,
    ReactiveFormsModule,
    AuthComponent,
    MapComponent,
    HeaderComponent,
    ProfileComponent,
    RouterModule.forRoot(routes), 
    NgMultiSelectDropDownModule.forRoot(),
    AppRoutingModule,
    LoginComponent, 
    RegisterComponent, 
    ProfileModule, 
    RouterModule 
  ],
  providers: [
    ApiService,
    AuthInterceptor
  ]
 
})
export class AppModule {}
