import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import * as Dropbox from 'dropbox';
import { MonitoringService } from './monitoring.service';

export interface Token{
  accesstoken: any,
  expiration: any
}

@Injectable({
  providedIn: 'root'
})
export class DropboxService  {

  private dbx!: Dropbox.Dropbox;
  constructor(private MonitoringService: MonitoringService, private http: HttpClient) {
    this.obterToken();
  }

  async obterToken(): Promise<Token> {

    try {

      const clientId = (await this.MonitoringService.getDatatoken()).clientId;
      const clientSecret = (await this.MonitoringService.getDatatoken()).clientSecret;
      const refreshToken = (await this.MonitoringService.getDatatoken()).refreshToken;
      const tokenEndpoint = (await this.MonitoringService.getDatatoken()).tokenEndpoint;
      
      const data = {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret
      };
    
      // Faça uma solicitação HTTP POST para obter o novo token de acesso
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
    
      try {
        const response: any = await this.http.post(tokenEndpoint, this.urlEncodeParams(data), { headers }).toPromise();
    
        // Configure o cliente Dropbox com o novo token de acesso
        this.configurarDropbox(response.access_token);
        
        const subtractSeconds = 3600; // 1 hora

        // Obtendo o timestamp atual em milissegundos
        const currentTimestamp = Date.now();

        // Calculando o timestamp de expiração
        const expirationTimestamp = currentTimestamp + (response.expires_in - subtractSeconds) * 1000;
        // Criando um objeto Date com base no timestamp de expiração
        const expirationDate = new Date(expirationTimestamp);

        // Obtendo a data e hora no formato local
        const localExpirationDateTime = expirationDate.toLocaleString();

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
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  private urlEncodeParams(params: { [key: string]: string }): string {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

}
