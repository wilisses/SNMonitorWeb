import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MonitoringService } from '../../../service/monitoring.service';
import { Token } from '../../../monitoring/monitoring.component';
import { GenerateTokenDialogComponent } from '../generate-token-dialog/generate-token-dialog.component';



@Component({
  selector: 'app-config-dropbox-dialog',
  templateUrl: './config-dropbox-dialog.component.html',
  styleUrl: './config-dropbox-dialog.component.css'
})
export class ConfigDropboxDialogComponent implements OnInit{

  password: string = "";
  emailRemetente: string = "";
  clientId: string = "";
  clientSecret: string = "";
  refreshToken: string = "";
  tokenEndpoint: string = "";
  token: Token | undefined;
  emaildestinatarios: any;
  tokenBrevo:any;
  emaildestinatariosCopy: any;
  expirationDate: any;
  validationHours: any;
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
    this.emailRemetente = (await this.MonitoringService.getDatatoken()).remetente;
    this.password = (await this.MonitoringService.getDatatoken()).passwordRemetente;
    this.emaildestinatarios = (await this.MonitoringService.getDatatoken()).destinatarios;
    this.emaildestinatariosCopy = (await this.MonitoringService.getDatatoken()).destinatariosCopy;
    this.expirationDate = (await this.MonitoringService.getDatatoken()).expirationDate;
    this.tokenBrevo = (await this.MonitoringService.getDatatoken()).tokenBrevo;
    this.validationHours = (await this.MonitoringService.getDatatoken()).validationHours;
  }
  async linkTokenBrevo():Promise<void>{
    const dropboxAuthorizationUrl = `https://app-smtp.brevo.com/real-time`;
      
    const newTab = this.renderer.createElement('a');
    this.renderer.setAttribute(newTab, 'href', dropboxAuthorizationUrl);
    this.renderer.setAttribute(newTab, 'target', '_blank');
    this.renderer.appendChild(document.body, newTab);
    newTab.click();
    this.renderer.removeChild(document.body, newTab);
  }
  generatetoken():void{
    const dialogRef = this.dialog.open(GenerateTokenDialogComponent, {
      width: '35rem',
      height: '45rem',
      data: null,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if(res.edit){
        this.refreshToken = res.dados;
        this.expirationDate = this.auth.calcularDataExpiracao(3);
      }
    });
  }
  change(){

  }

  async submit(): Promise<void> {
    
    this.token = {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      refreshToken: this.refreshToken,
      tokenEndpoint: this.tokenEndpoint,
      remetente: this.emailRemetente,
      passwordRemetente: this.password,
      destinatarios: this.emaildestinatarios,
      destinatariosCopy: this.emaildestinatariosCopy,
      expirationDate: this.expirationDate,
      tokenBrevo: this.tokenBrevo,
      validationHours: this.validationHours,

    }

    try {
      await this.MonitoringService.updateToken(this.token);
      this.auth.Alert('Salvo com sucesso!', 3000);
    } catch (error) {
      console.error('Erro ao atualizar o registro:', error);
    }

    this.dialogRef.close();
  }

}
