import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api/polygons';

  constructor(private http: HttpClient) {} 

 
  //  Kullanıcıları Getir
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`,).pipe(
      catchError(this.handleError)
    );
  }

  //  Test Endpoint'i
  getTest(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/test`,).pipe(
      catchError(this.handleError)
    );
  }

  //  Kullanıcı Ekle
  addUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, user,).pipe(
      catchError(this.handleError)
    );
  }

  //  Kullanıcı Güncelle
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, user,).pipe(
      catchError(this.handleError)
    );
  }

  //  Kullanıcı Sil
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`,).pipe(
      catchError(this.handleError)
    );
  }

  //  Poligonları Getir
  addPolygon(polygonData: any): Observable<any> {
    if (!polygonData.name || !polygonData.city || !polygonData.district) {
      return throwError(() => new Error('Lütfen tüm alanları doldurun.'));
    }
  
    return this.http.post(`${this.apiUrl}`, polygonData, {
    }).pipe(
      tap(data => console.log('Poligon eklendi:', data)),
      catchError(this.handleError)
    );
  }  

getPolygons(userId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
}


  updatePolygon(id: string, polygon: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${encodeURIComponent(id)}`, polygon, {
    }).pipe(
      tap(() => console.log(`Poligon güncellendi: ${id}`)),
      catchError(this.handleError)
    );
  }

  deletePolygon(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${encodeURIComponent(id)}`, {
    }).pipe(
      tap(() => console.log(`Poligon silindi: ${id}`)),
      catchError(this.handleError)
    );
  }

  getUserData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateProfile`, profileData, {
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(userId: string, data: any): Observable<any> {
    return this.http.put(`http://localhost:5000/api/auth/update-profile/${userId}`, data, {
    }).pipe(
      catchError(this.handleError)
    );
  }
  

  //  İSTATİSTİK GETİR
  getStatistics(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getStatistics/${encodeURIComponent(userId)}`, {
    }).pipe(
      catchError(this.handleError)
    );
  }

  //  Hata Yönetimi
  private handleError(error: any) {
    console.error('API hatası:', error);

    let errorMessage = 'Bilinmeyen bir hata oluştu.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `İstemci Hatası: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage = 'Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.';
    } else {
      errorMessage = `Hata Kodu: ${error.status}\nMesaj: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
