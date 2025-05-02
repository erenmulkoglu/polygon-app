import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  isLoggedIn = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Giriş durumu kontrolü
    this.isLoggedIn = this.authService.isLoggedIn();

    //  BehaviorSubject ile dinleyelim
    this.authService.userName$.subscribe(name => {
      console.log('Kullanıcı adı güncelleniyor:', name);
      this.userName = name || '';
      this.isLoggedIn = this.authService.isLoggedIn();
    });
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = '';
    this.router.navigate(['/login']);
  }
}
