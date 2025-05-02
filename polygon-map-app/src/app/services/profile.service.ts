import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:5000/api/users'; 

  constructor(private http: HttpClient) {}

  updateProfile(userId: string, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(
      `http://localhost:5000/api/users/update-profile/${userId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
      }
    );
  }
}  
