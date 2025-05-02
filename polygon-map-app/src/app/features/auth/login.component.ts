import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  onLogin() {
    if (this.loginForm.invalid) {
        this.errorMessage = 'Email ve şifre gerekli!';
        return;
    }

    const body = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
    };

    console.log("Giriş yapılıyor:", body);
  this.authService.login(body.email, body.password).subscribe({
    next: (res: any) => {
      console.log('Giriş başarılı:', res);
      this.router.navigate(['/map']); //  Başarı durumunda yönlendirme yapıyoruz
    },
    error: (err) => {
      console.error('Giriş hatası:', err);
      this.errorMessage = err.error.message || 'Giriş yapılamadı.';
      }
    });
  }
}
