import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  //  Kullanıcı adını saklamak için BehaviorSubject kullanıyoruz
  private userNameSubject = new BehaviorSubject<string | null>(null);
  userName$ = this.userNameSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      this.userNameSubject.next(savedUserName);
    }
  }
  

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    this.userNameSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    }
    return null;
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        console.log('Giriş başarılı:', response);
  
        // Yanıtın formatını kontrol edelim
        console.log('Dönen yanıt:', response);
  
        if (response.user && response.user.name) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user._id);
          localStorage.setItem('userName', response.user.name);
          this.userNameSubject.next(response.user.name); // BehaviorSubject güncelleniyor
        } else {
          console.error('Kullanıcı adı yanıtı eksik!');
        }
      })
    );
  }
  
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  setUserName(name: string) {
    this.userNameSubject.next(name);
  }
  
}
