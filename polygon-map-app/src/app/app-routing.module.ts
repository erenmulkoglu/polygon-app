import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './register/register.component';
import { MapComponent } from './features/map/map.component';
import { ProfileComponent } from './features/profile/profile.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent }, //  Ana giriş ekranı
  { path: 'register', component: RegisterComponent }, //  Kayıt ekranı
  { path: 'map', component: MapComponent }, //  Harita ekranı
  { path: 'profile', component: ProfileComponent }, //  Profil ekranı
  { path: '', redirectTo: '/map', pathMatch: 'full' }, //  Giriş yaptıktan sonra HARİTAYA YÖNLENDİR
  { path: '**', redirectTo: '/map' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
