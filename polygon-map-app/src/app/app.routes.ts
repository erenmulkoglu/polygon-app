import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { MapComponent } from './features/map/map.component';
import { HeaderComponent } from './components/header/header.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: '', component: AuthComponent,  },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'map', component: MapComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent }, //  Ana giriş ekranı
  { path: 'register', component: RegisterComponent }, //  Kayıt ekranı
    { path: '**', redirectTo: 'login' },
    { path: 'login', component: AuthComponent },
  { path: 'header', component: HeaderComponent },
  ...AUTH_ROUTES
   //  Standalone olduğu için doğrudan kullandık
];
