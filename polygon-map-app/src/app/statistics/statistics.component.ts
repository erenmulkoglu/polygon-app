import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  imports: [CommonModule, HttpClientModule],
  providers: [ApiService], //  ApiService standalone bileşene eklendi

})
export class StatisticsComponent implements OnInit {
  totalPolygons: number = 0;
  totalArea: number = 0;
  smallAreaCount: number = 0;
  mediumAreaCount: number = 0;
  largeAreaCount: number = 0;

    constructor(private apiService: ApiService, private authService: AuthService) {}
  
    ngOnInit(): void {
      const userId = this.authService.getUserId(); // Giriş yapan kullanıcıdan al
      if (!userId) {
        console.error('Kullanıcı ID bulunamadı!');
        return;
      }

        this.apiService.getPolygons(userId).subscribe({
          next: (polygons) => {
            this.totalPolygons = polygons.length;
            this.totalArea = polygons.reduce((sum, p) => sum + p.area, 0);
      
            this.smallAreaCount = polygons.filter(p => p.area < 100000).length;
            this.mediumAreaCount = polygons.filter(p => p.area >= 100000 && p.area < 300000).length;
            this.largeAreaCount = polygons.filter(p => p.area >= 300000).length;
      
            console.log('İstatistikler güncellendi:', {
              totalPolygons: this.totalPolygons,
              totalArea: this.totalArea,
              smallAreaCount: this.smallAreaCount,
              mediumAreaCount: this.mediumAreaCount,
              largeAreaCount: this.largeAreaCount
            });
          },
          error: (err) => {
            console.error('İstatistikler yüklenemedi:', err);
          }
        });
      }
      

  //  İstatistikleri Çek ve Güncelle
  getStatistics(): void {
    const userId = '60abcd1234ef567890'; // Sabit test user ID
    this.apiService.getStatistics(userId).subscribe(
      (data) => {
        this.totalPolygons = data.totalPolygons;
        this.totalArea = data.totalArea;
        this.smallAreaCount = data.smallAreaCount;
        this.mediumAreaCount = data.mediumAreaCount;
        this.largeAreaCount = data.largeAreaCount;
      },
      (error) => {
        console.error('İstatistikler yüklenemedi:', error);
      }
    );
  }
}
