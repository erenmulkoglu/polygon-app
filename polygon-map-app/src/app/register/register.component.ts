import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]

})
export class RegisterComponent {
  registerForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  passwordsMatch = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,

  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      gender: ['Erkek', Validators.required] // Varsayılan olarak 'Erkek' seçili
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      // Eğer giriş yapılmışsa haritaya yönlendir
      this.router.navigate(['/map']);
    }
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Tüm alanları eksiksiz doldurun!';
      return;
    }
    // Şifre kontrolü
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.passwordsMatch = false;
      return;
    } else {
      this.passwordsMatch = true;
    }

    this.isLoading = true;
    const body = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      gender: this.registerForm.value.gender
    };

    console.log('Kayıt yapılıyor:', body);

    this.authService.register(body).subscribe({
      next: (res: any) => {
        console.log('Kayıt başarılı:', res);
        this.authService.login(body.email, body.password).subscribe(() => {
          this.router.navigate(['/map']);
        });
      },
      error: (err) => {
        console.error('Kayıt hatası:', err);
        this.errorMessage = err.error.error || 'Kayıt yapılamadı.';
      }
    });
  }
}
