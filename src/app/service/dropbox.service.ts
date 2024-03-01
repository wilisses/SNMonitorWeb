import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import * as Dropbox from 'dropbox';
import { MonitoringService } from './monitoring.service';
import { Observable } from 'rxjs';
import { addSeconds, format, setSeconds } from 'date-fns';

export interface Token{
  accesstoken: any,
  expiration: any
}

@Injectable({
  providedIn: 'root'
})
export class DropboxService  {
  clientId:any;
  clientSecret:any;
  authorizationEndpoint:any;
  tokenEndpoint:any;
  refreshToken:any;

  private dbx!: Dropbox.Dropbox;
  constructor(private MonitoringService: MonitoringService, private http: HttpClient) {
    this.Token();

  }
  async Token(): Promise<any> {
    let result: any = null;
  
    try {
      const dateHourCurrent = format(setSeconds(new Date(), 0), 'yyyy-MM-dd HH:mm');
      const dataHourExpiration = localStorage.getItem('expirationToken');
      
      if (dataHourExpiration && new Date(dateHourCurrent) >= new Date(dataHourExpiration)) {
        this.clientId = (await this.MonitoringService.getDatatoken()).clientId;
        this.clientSecret = (await this.MonitoringService.getDatatoken()).clientSecret;
        this.refreshToken = (await this.MonitoringService.getDatatoken()).refreshToken;
        this.tokenEndpoint = (await this.MonitoringService.getDatatoken()).tokenEndpoint;
        
        const data = {
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret
        };
      
        // Faça uma solicitação HTTP POST para obter o novo token de acesso
        const headers = new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        });
      
        try {
        const response: any = await this.http.post(this.tokenEndpoint, this.urlEncodeParams(data), { headers }).toPromise();
          const expiration = format(addSeconds(new Date(), (response.expires_in - 900)), 'yyyy-MM-dd HH:mm');
          localStorage.setItem('expirationToken', expiration);
          localStorage.setItem('TokenApp', response.access_token);

          result = localStorage.getItem('TokenApp');
        } catch (error) {
          console.error('Erro ao obter o token:', error);
          throw error; // Propague o erro para quem chama essa função, se necessário
        }
      } else {
        result = localStorage.getItem('TokenApp');
      }
     
    } catch (error) {
      console.error('Erro ao obter o token:', error);
      throw error; // Propague o erro se necessário
    }
    this.configurarDropbox(result);
    return result;
  }

  async obterToken(): Promise<Token> {

    try {

      this.clientId = (await this.MonitoringService.getDatatoken()).clientId;
      this.clientSecret = (await this.MonitoringService.getDatatoken()).clientSecret;
      this.refreshToken = (await this.MonitoringService.getDatatoken()).refreshToken;
      this.tokenEndpoint = (await this.MonitoringService.getDatatoken()).tokenEndpoint;
      
      const data = {
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret
      };
    
      // Faça uma solicitação HTTP POST para obter o novo token de acesso
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
    
      try {
        const response: any = await this.http.post(this.tokenEndpoint, this.urlEncodeParams(data), { headers }).toPromise();
    
        // Configure o cliente Dropbox com o novo token de acesso
        this.configurarDropbox(response.access_token);
        
        const subtractSeconds = 900; // 1 hora

        // Obtendo o timestamp atual em milissegundos
        const currentTimestamp = Date.now();

        // Calculando o timestamp de expiração
        const expirationTimestamp = currentTimestamp + (response.expires_in - subtractSeconds) * 1000;
        // Criando um objeto Date com base no timestamp de expiração
        const expirationDate = new Date(expirationTimestamp);

        // Obtendo a data e hora no formato local
        const localExpirationDateTime = expirationDate.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
        
        return {
          accesstoken: response.access_token,
          expiration: localExpirationDateTime
        };
      } catch (error) {
        console.error('Erro ao obter o token:', error);
        throw error; // Propague o erro para quem chama essa função, se necessário
      }
    } catch (error) {
      console.error('Erro ao obter o token:', error);
      throw error; // Propagate the error if necessary
    }
  }
  

  configurarDropbox(token: string): void {
    this.dbx = new Dropbox.Dropbox({
      accessToken: token,
    });
  }

  async listarArquivos(caminho: string): Promise<Dropbox.files.ListFolderResult> {
    try {
      
      const response = await this.dbx.filesListFolder({ path: caminho });
     
      return response.result;
    } catch (error) {
      console.error(`Erro ao listar arquivos:${caminho}`, error);
      throw error;
    }
  }

  private urlEncodeParams(params: { [key: string]: string }): string {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  getAuthorizationUrl(): string {
    return `${this.authorizationEndpoint}?response_type=code&client_id=${this.clientId}&token_access_type=offline`;
  }

  getToken(authorizationCode: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = `code=${authorizationCode}&grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}`;

    return this.http.post(this.tokenEndpoint, body, { headers });
  }

}
