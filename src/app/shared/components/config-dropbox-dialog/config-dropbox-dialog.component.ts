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
  expirationDate: any;

  constructor(
    public auth: AuthService,
    public dialogRef: MatDialogRef<ConfigDropboxDialogComponent>,
    public dialog: MatDialog,
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
    this.expirationDate = (await this.MonitoringService.getDatatoken()).expirationDate;
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
          this.expirationDate = this.auth.calcularDataExpiracao(4);
         
       }
      });
  }
  change(){

  }

  async submit(): Promise<void> {
    const diasParaExpiracao = 4; 
    
    this.token = {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      refreshToken: this.refreshToken,
      tokenEndpoint: this.tokenEndpoint,
      remetente: this.emailRemetente,
      passwordRemetente: this.password,
      destinatarios: this.emaildestinatarios,
      expirationDate: this.expirationDate,
    }

    try {
      await this.MonitoringService.updateToken(this.token);
      this.auth.Alert('Salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar o registro:', error);
    }

    this.dialogRef.close();
  }

}
