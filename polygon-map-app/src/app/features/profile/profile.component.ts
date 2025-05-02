import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  successMessage = '';
  errorMessage = '';

  userId!: string;
  passwordMatchValidator: any;
  isLoading: any;

  constructor(private fb: FormBuilder, private http: HttpClient,private authService: AuthService, private router: Router //  AuthService ile kullanıcı ID'sini alacağız
  ) {}

  ngOnInit(): void {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', Validators.minLength(6)],
      confirmNewPassword: ['', Validators.minLength(6)]
    }, { validator: this.passwordMatchValidator });

    this.getUserData();

  }

  getUserData() {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.authService.getToken()}`
    });

    this.http.get(`http://localhost:5000/api/users/${this.authService.getUserId()}`, { headers })
        .subscribe({
            next: (user: any) => {
                this.profileForm.patchValue({
                    name: user.name,
                    email: user.email
                });
            },
            error: (err) => {
                console.error('Kullanıcı bilgileri alınamadı:', err);
                this.errorMessage = 'Kullanıcı bilgileri alınamadı!';
            }
        });

}
  onUpdateProfile() {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Formu eksiksiz doldurunuz.';
      return;
    }
  
    const userId = this.authService.getUserId(); // Kullanıcı ID'sini token'dan al
  
    const body = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
      currentPassword: this.profileForm.value.currentPassword,
      newPassword: this.profileForm.value.newPassword
    };
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  
    this.isLoading = true;
  
    this.http.put(`http://localhost:5000/api/auth/update-profile/${userId}`, body, { headers })
    .subscribe({
        next: (res: any) => {
          this.successMessage = 'Profil başarıyla güncellendi!';
          this.errorMessage = '';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Güncelleme hatası:', err);
          this.errorMessage = err.error.message || 'Profil güncellenemedi.';
          this.successMessage = '';
          this.isLoading = false;
        }
      });
  }
}



