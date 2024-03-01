import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MonitoringService } from '../../../service/monitoring.service';
import { AuthService } from '../../../service/auth.service';
import { EmailService } from '../../../service/email.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Send } from '../../../monitoring/monitoring.component';

@Component({
  selector: 'app-pending-dialog',
  templateUrl: './pending-dialog.component.html',
  styleUrl: './pending-dialog.component.css'
})
export class PendingDialogComponent implements OnInit{
  dados: any;
  emailPending: string = '';
  telefonePending: string = '';
  responsavelPending: string = '';
  user:any;
  pasta: string = '';
  information:any;
  constructor(
    public auth: AuthService,
    public dialogRef: MatDialogRef<PendingDialogComponent>,
    public dialog: MatDialog,
    private MonitoringService: MonitoringService,
    @Inject(MAT_DIALOG_DATA) public data?: any,
    
  ) {}

  async ngOnInit():Promise<void>{

    this.user = this.auth.UserAuth();
    
    this.dados = this.data;

    if((await this.MonitoringService.getDataRegister(this.dados.key)).config !== undefined){
      this.pasta = JSON.parse((await this.MonitoringService.getDataRegister(this.dados.key)).config.bancos)[0].caminhopasta;   
    }

    this.emailPending = (await this.MonitoringService.getDataRegister(this.dados.key)).email;
    this.telefonePending = (await this.MonitoringService.getDataRegister(this.dados.key)).telefone;
    this.responsavelPending = (await this.MonitoringService.getDataRegister(this.dados.key)).responsavel;

    
  }

  async sendEmail(): Promise<void> {
    const dados: Send = {
      dateCurrent:this.dados.dateCurrent,
      sizeCurrent:this.dados.sizeCurrent,
      sizePrevious:this.dados.sizePrevious,
      pasta:this.pasta,
      key:this.dados.key,
      responsavel:this.responsavelPending,
      email: this.emailPending, 
      telefone: this.telefonePending,
    }

    this.auth.sendEmail(dados)
    .then(successMessage => {
      this.auth.Alert(successMessage, 3000);

      const logdados = {
        key:this.dados.key,
        situation: 'E-mail/WhatsApp Enviado',
        situationPrevious:this.dados.status,
        movementdate: this.auth.getCurrentDateTime(),
        date: this.auth.getCurrentDate(),
        dateCurrent: this.auth.formatDate3(this.dados.dateCurrent),
        namefile: this.dados.nameCurrent,
        sizefile: this.dados.sizeCurrent,
        percentage: this.dados.percentage,
        dataBase: this.dados.nameDataBase,
      };
      
      this.MonitoringService.logMonitoring(logdados);
    })
    .catch(errorInfo => {
      this.auth.Alert(errorInfo.message, 3000);
      console.error(errorInfo.message, errorInfo.error);
    });
  }
  
  
  log():void{
    this.auth.navigate(`Log/${this.dados.key}/0`);
      
    this.dialogRef.close();
  }
  Register():void{
    this.auth.navigate(`Register/${this.dados.key}`);
      
    this.dialogRef.close();
  }
  async whatsapp(): Promise<void> {
    const dados: Send = {
      dateCurrent:this.dados.dateCurrent,
      sizeCurrent:this.dados.sizeCurrent,
      sizePrevious:this.dados.sizePrevious,
      pasta:this.pasta,
      key:this.dados.key,
      responsavel:this.responsavelPending,
      email: this.emailPending, 
      telefone: this.telefonePending,
    }

    this.auth.whatsapp(dados);

    const logdados = {
      key:this.dados.key,
      situation: 'E-mail/WhatsApp Enviado',
      situationPrevious:this.dados.status,
      movementdate: this.auth.getCurrentDateTime(),
      date: this.auth.getCurrentDate(),
      dateCurrent: this.auth.formatDate3(this.dados.dateCurrent),
      namefile: this.dados.nameCurrent,
      sizefile: this.dados.sizeCurrent,
      percentage: this.dados.percentage,
      dataBase: this.dados.nameDataBase,
    };
    
    this.MonitoringService.logMonitoring(logdados);
  }
  

}

