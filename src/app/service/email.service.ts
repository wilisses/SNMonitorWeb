// email.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { MonitoringService } from './monitoring.service';
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = 'https://api.brevo.com/v3/smtp/email'; // Substitua pela URL correta da API da Brevo

  constructor(private http: HttpClient,private MonitoringService: MonitoringService) {}

  async sendTransactionalEmail(emailData: any): Promise<Observable<any>> {
    const tokenBrevo = (await this.MonitoringService.getDatatoken()).tokenBrevo;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': tokenBrevo,
    });
  
    return this.http.post<any>(this.apiUrl, emailData, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao enviar e-mail:', error);
        throw error;
      })
    );
  }
  
  
  
}
