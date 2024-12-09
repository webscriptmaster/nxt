import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocialLoginService {
  private loginBySocialResponse = new BehaviorSubject<any>(null);
  data$ = this.loginBySocialResponse.asObservable();
  constructor(private http: HttpClient) {}

  setSignUpdata(data: any) {
    this.loginBySocialResponse.next(data);
  }
  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${environment.apiURL}/login/google`, { idToken });
  }

  saveToken(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        email: data.email,
        id: data.uid,
      })
    );
  }
}
