import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailAutomationService {

  constructor(
    private http: HttpClient,
  ) { }

  scheduleEmail(data: any): any {
      const url = `${environment.apiPaymentURL}/zapier/webhook`;
      console.log(data);
      return this.http.post(url, data);
  }
}
