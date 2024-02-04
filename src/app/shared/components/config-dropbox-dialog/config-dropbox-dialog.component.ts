import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MonitoringService } from '../../../service/monitoring.service';
import { Token } from '../../../monitoring/monitoring.component';



@Component({
  selector: 'app-config-dropbox-dialog',
  templateUrl: './config-dropbox-dialog.component.html',
  styleUrl: './config-dropbox-dialog.component.css'
})
export class ConfigDropboxDialogComponent implements OnInit{
  
clientId: string = "";
clientSecret: string = "";
refreshToken: string = "";
tokenEndpoint: string = "";
token: Token | undefined;

  constructor(
    public auth: AuthService,
    public dialogRef: MatDialogRef<ConfigDropboxDialogComponent>,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private MonitoringService: MonitoringService,
    @Inject(MAT_DIALOG_DATA) public data?: any,
    
  ) {}

  async ngOnInit(): Promise<void> {

    this.clientId = (await this.MonitoringService.getDatatoken()).clientId;
    this.clientSecret = (await this.MonitoringService.getDatatoken()).clientSecret;
    this.refreshToken = (await this.MonitoringService.getDatatoken()).refreshToken;
    this.tokenEndpoint = (await this.MonitoringService.getDatatoken()).tokenEndpoint;

  }

  generatetoken():void{
    
      const dropboxAuthorizationUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${this.clientId}&token_access_type=offline`;
      
      // Open the URL in a new tab
      const newTab = this.renderer.createElement('a');
      this.renderer.setAttribute(newTab, 'href', dropboxAuthorizationUrl);
      this.renderer.setAttribute(newTab, 'target', '_blank');
      this.renderer.appendChild(document.body, newTab);
      newTab.click();
      this.renderer.removeChild(document.body, newTab);
    
  }
  change(){

  }

  async submit(): Promise<void> {

    this.token = {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      refreshToken: this.refreshToken,
      tokenEndpoint: this.tokenEndpoint,
    }

    try {
      await this.MonitoringService.updateToken(this.token);
      this.auth.Alert('Salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar o registro:', error);
    }
    
    this.dialogRef.close();
  }
}
