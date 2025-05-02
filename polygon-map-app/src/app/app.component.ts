import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { MapComponent } from './features/map/map.component';
import { HeaderComponent } from './components/header/header.component';
import { ProfileComponent } from './features/profile/profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  template: `<router-outlet></router-outlet>`, // Sayfanın içeriğini yönlendiren bileşen
  imports: [RouterModule, ProfileComponent, AuthComponent, MapComponent, HeaderComponent]
})

export class AppComponent {
  title: string = 'polygon-map-app'; 

   //  Katmanları Aç/Kapa Fonksiyonu
   toggleLayer() {
     console.log('Katmanlar gizleniyor/gösteriliyor');
   }
 
   //  Çıkış Yap Fonksiyonu
   logout() {
    console.log('Çıkış yapılıyor...');
    localStorage.removeItem('token');
    
    // Haritayı sıfırla ve başlangıç zoom seviyesine döndür
    const mapComponent = document.querySelector('app-map') as any;
    if (mapComponent) {
      mapComponent.resetMap(); // Haritayı sıfırla
    }
  
    window.location.reload();
  }  
 }
