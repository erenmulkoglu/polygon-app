import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class AuthComponent {
  email = '';
  password = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  registerGender = '';
  errorMessage = '';
  successMessage = '';

  isRegisterPage = false;
  userNameSubject: any;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService
  ) {
    this.route.url.subscribe(url => {
      this.isRegisterPage = url[0]?.path === 'register';
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/map']);
    }
  }

  setUserName(name: string) {
    this.userNameSubject.next(name);
  }

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email ve şifre gerekli!';
      return;
    }

    const body = {
      email: this.email,
      password: this.password
    };
    

    this.http.post('http://localhost:5000/api/auth/login', body)
      .subscribe({
        next: (res: any) => {
          console.log('Giriş başarılı:', res);
          localStorage.setItem('token', res.token);
          localStorage.setItem('userId', res.user.id);
          localStorage.setItem('userName', res.user.name); // yeni satır
          this.authService.setUserName(res.user.name);
          this.router.navigate(['/map']);
        },
        error: (err) => {
          console.error('Giriş hatası:', err);
          this.errorMessage = err.error.error || 'Giriş yapılamadı.';
        }
      });
  }

  register() {
    if (
      !this.registerName || 
      !this.registerEmail || 
      !this.registerPassword || 
      !this.registerConfirmPassword || 
      !this.registerGender
    ) {
      this.errorMessage = 'Tüm alanlar zorunludur!';
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.errorMessage = 'Şifreler eşleşmiyor!';
      return;
    }

    //  POST isteği için doğru JSON yapısını gönderiyoruz
    const body = {
      name: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword,
      confirmPassword: this.registerConfirmPassword,
      gender: this.registerGender
    };

    console.log('Kayıt yapılıyor:', body);

    this.http.post('http://localhost:5000/api/auth/register', body)
      .subscribe({
        next: (res: any) => {
          console.log('Kayıt başarılı:', res);
          this.successMessage = 'Kayıt başarılı! Haritaya yönlendiriliyorsunuz...';
          this.errorMessage = '';

          //  Başarılı olunca 500ms sonra haritaya yönlendir
          setTimeout(() => {
            this.router.navigate(['/map']);
          }, 500);
        },
        error: (err) => {
          console.error('Kayıt hatası:', err);

          //  Sunucudan gelen hata mesajını göster
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Kayıt yapılamadı.';
          }
          this.successMessage = '';
        }
      });
  }
}
