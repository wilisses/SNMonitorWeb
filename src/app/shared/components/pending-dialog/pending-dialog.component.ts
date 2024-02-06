import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MonitoringService } from '../../../service/monitoring.service';
import { AuthService } from '../../../service/auth.service';



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

  
  email(data:string):void{
    console.log("email",data);
  }
  whatsapp(data:string):void{
    const Telefone = data.replace(/\D/g, ""); 
  
    const dataAtual = new Date();
    const dataAnterior = new Date(dataAtual);
    dataAnterior.setDate(dataAtual.getDate() - 1);
    const formatoData = { year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const stringDataAtual = dataAtual.toLocaleDateString('pt-BR', formatoData);
    const stringDataAnterior = dataAnterior.toLocaleDateString('pt-BR', formatoData);

    let saudacao;
    const agora = new Date();
    const horas = agora.getHours();
    const minutos = agora.getMinutes();

    if(`${horas}${minutos}` > '0000' && `${horas}${minutos}` < '1200'){
      saudacao = "Bom dia";
    } else if (`${horas}${minutos}` > '1200' && `${horas}${minutos}` < '1800') {
      saudacao = "Boa tarde";
    } else {
      saudacao = "Boa noite";
    }


    let situacao;
    if(this.auth.formatDate3(this.dados.dateCurrent) === this.auth.formatDate3(stringDataAtual) || this.auth.formatDate3(this.dados.dateCurrent) === this.auth.formatDate3(stringDataAnterior)){
      if(this.dados.sizeCurrent === 0){
        situacao = `*${this.auth.formatDate4(this.dados.dateCurrent)}* relativos à loja ${this.pasta} - CNPJ: ${this.auth.formatCNPJ(this.dados.key)} se encontram em nossos servidores com tamanho *zerado*.`;
      } else if( this.auth.removeSufixoformatSize1(this.dados.sizePrevious) > this.auth.removeSufixoformatSize1(this.dados.sizeCurrent)){
        situacao = `*${this.auth.formatDate4(this.dados.dateCurrent)}* relativos à loja ${this.pasta} - CNPJ: ${this.auth.formatCNPJ(this.dados.key)} se encontram em nossos servidores com tamanho *reduzido*.`; 
      } else {
        this.auth.Alert("A situação do backup encontra-se sem pendências!");
      }
    } else {
      if(this.auth.formatDate3(this.dados.dateCurrent) === this.auth.formatDate3(stringDataAtual)){
        situacao = `*${this.auth.formatDate4(stringDataAtual)}* relativos à loja ${this.pasta} - CNPJ: ${this.auth.formatCNPJ(this.dados.key)} ainda não se encontram em nossos servidores.`;
      } else {
        situacao = `*${this.auth.formatDate4(this.dados.dateCurrent)}* a *${this.auth.formatDate4(stringDataAtual)}* relativos à loja ${this.pasta} - CNPJ: ${this.auth.formatCNPJ(this.dados.key)} ainda não se encontram em nossos servidores.`;
      }
    }
    
    let mensagem: string = `${saudacao}, ${this.responsavelPending.toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase())},\nEspero que esta mensagem o encontre bem.\n\n`;
    mensagem += "Identificamos que os backups do(s) dia(s) ";
    mensagem += situacao + "\n";
    mensagem += "Solicitamos o acesso à máquina onde a aplicação está instalada para resolvermos esta pendência.\n\n";
    mensagem += "Agradecemos pela colaboração.\n\n";
    mensagem += `Atenciosamente,\n${this.user.name} - ${this.user.role}.\nVRFortaleza`;

    const textoCodificado: string = encodeURIComponent(mensagem);

    const linkWhatsApp = "https://api.whatsapp.com/send/?phone=55"+Telefone+"&text="+textoCodificado;
    
    try {

      window.open(linkWhatsApp, '_blank');
    } catch (error) {
      console.error('Erro ao tentar abrir o link:', error);
    }
  
  }

  
  

}

