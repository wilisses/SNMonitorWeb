import { Component, Inject, Renderer2 } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DropboxService } from '../../../service/dropbox.service';
import { MonitoringService } from '../../../service/monitoring.service';

@Component({
  selector: 'app-generate-token-dialog',
  templateUrl: './generate-token-dialog.component.html',
  styleUrl: './generate-token-dialog.component.css'
})
export class GenerateTokenDialogComponent {
  codeAuthentication: any;
  tokenRefresh: any;
  edit: boolean = false;

  constructor(
    public auth: AuthService,
    public dialogRef: MatDialogRef<GenerateTokenDialogComponent>,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private MonitoringService: MonitoringService,
    private dropBox: DropboxService,
    @Inject(MAT_DIALOG_DATA) public data?: any,
    
  ) {}

  async generateCodeAuthentication():Promise<void>{

    const clientId = (await this.MonitoringService.getDatatoken()).clientId;
    const dropboxAuthorizationUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${clientId}&token_access_type=offline`;
      
    const newTab = this.renderer.createElement('a');
    this.renderer.setAttribute(newTab, 'href', dropboxAuthorizationUrl);
    this.renderer.setAttribute(newTab, 'target', '_blank');
    this.renderer.appendChild(document.body, newTab);
    newTab.click();
    this.renderer.removeChild(document.body, newTab);
  }

  submit():void{
    const res = {
      dados: this.tokenRefresh,
      edit: this.edit
    }
    
    this.dialogRef.close(res);
  }

  change(item: string):void{
    if(item === 'codeAuthentication'){
      
      this.dropBox.getToken(this.codeAuthentication).subscribe(
        (data) => {
          this.edit = true;
          this.tokenRefresh = data.refresh_token;
          this.auth.Alert('Token gerado com sucesso!', 3000);
        },
        (error) => {
          this.tokenRefresh = `Erro ao obter token.`;
          console.error("Erro ao obter token:", error);
          
        }
      );
    }
  }

}
