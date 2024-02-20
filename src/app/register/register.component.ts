import { Component, DoCheck, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormControl } from '@angular/forms';
import { MonitoringService } from '../service/monitoring.service';
import { ConfigDialogComponent } from '../shared/components/config-dialog/config-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LicenseDialogComponent } from '../shared/components/license-dialog/license-dialog.component';

export interface Register {
  razaoSocial: string;
  status: string;
  email: string;
  responsavel: string;
  telefone: string;
  acesso: string;
  senha: string;
  qtdLoja: string;
  estado: string;
  so: string;
  observacao: string;
  config: any;
  expirationDate: string;
}


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, DoCheck {
  key: string = '';
  firstNameAutofilled: boolean | null = null;
  lastNameAutofilled: boolean | null = null;

  myControlnumbers = new FormControl('');
  myControlstatesBrazil = new FormControl('');
  myControlsos = new FormControl('');
  myControlstatuss = new FormControl('');
  statuss: string[] = ['Ativo','Cancelado'];
  numbers: string[] = [];
  statesBrazil: string[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  sos: string[] = ['Windows', 'Linux', 'MAC'];
  floatLabelControl = new FormControl('ano');

  register: Register | undefined;
  banco: any = [];
  editConfig: boolean = false;
  editLicense: boolean = false;
  pasta: string = '';
  user: any;

  razaoSocial: string = '';
  status: string = '';
  email: string = '';
  responsavel: string = '';
  telefone: string = '';
  acesso: string = '';
  senha: string = '';
  qtdLoja: string = '';
  estado: string = '';
  so: string = '';
  observacao:  string = '';
  expirationDate: any;
  expirationDateLicense: any;

  constructor(private route: ActivatedRoute,private renderer: Renderer2, public auth: AuthService, private MonitoringService: MonitoringService,public dialog: MatDialog) {}

  ngOnInit(): void {
    this.user = this.auth.UserAuth();

    if(this.user){

      for (let i = 1; i <= 50; i++) {
        this.numbers.push(i.toString());
      }

      this.route.params.subscribe(params => {
        this.key = params['key'];

        this.table(this.key);
      });
    } else {
      this.auth.navigate("");
    }
  }

  async submit(): Promise<void> {
    let dadosconfig:any = {};
    if(!this.editConfig && (await this.MonitoringService.getDataRegister(this.key)).config !== undefined){
      let bancoss = (await this.MonitoringService.getDataRegister(this.key)).config.bancos;
      
      const host = (await this.MonitoringService.getDataRegister(this.key)).config.host;
      const particao = (await this.MonitoringService.getDataRegister(this.key)).config.particao;
      const pastaBin = (await this.MonitoringService.getDataRegister(this.key)).config.pastaBin;
      const port = (await this.MonitoringService.getDataRegister(this.key)).config.port;
      const expirationDate = (await this.MonitoringService.getDataRegister(this.key)).config.expirationAccess;
      const access = (await this.MonitoringService.getDataRegister(this.key)).config.token_access;

      dadosconfig = {
        host: host,
        port: port,
        pastaBin: pastaBin,
        particao: particao,
        bancos: bancoss,
        token_access: access,
        expirationAccess: expirationDate, 
      };
    } else if(this.editConfig === false && (await this.MonitoringService.getDataRegister(this.key)).config === undefined){
      this.auth.Alert("Preencha todos os campos obrigatórios.");
      return;
    }
  
    this.register = {
      razaoSocial: this.razaoSocial,
      status: this.status === 'Ativo' ? "1" : "0",
      email: this.email,
      responsavel: this.responsavel,
      telefone: formatarNumeroTelefone(this.telefone),
      acesso: this.acesso,
      senha: this.senha,
      qtdLoja: this.qtdLoja,
      estado: this.estado,
      so: this.so,
      observacao: this.observacao,
      config: this.editConfig ? this.banco : dadosconfig,
      expirationDate: this.editLicense ? this.expirationDateLicense : this.expirationDate,
    };
      
    try {
      await this.MonitoringService.updateRegister(this.key, this.register);
      this.auth.Alert('Salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar o registro:', error);
    }

    function formatarNumeroTelefone(numero: string): string {
      // Remover todos os caracteres não numéricos do número
      const numeroLimpo = numero.replace(/\D/g, '');
    
      // Verificar se o número tem o formato correto (11 dígitos)
      if (numeroLimpo.length !== 11) {
        // Se não tiver 11 dígitos, retornar o número original
        return numero;
      }
    
      // Formatar o número com parênteses, espaço e hífen
      const codigoArea = numeroLimpo.slice(0, 2);
      const parte1 = numeroLimpo.slice(2, 3);
      const parte2 = numeroLimpo.slice(3, 7);
      const parte3 = numeroLimpo.slice(7, 11);
    
      const numeroFormatado = `(${codigoArea}) ${parte1} ${parte2}-${parte3}`;
      return numeroFormatado;
    }

  }

  signOut():void {
    this.auth.navigate("Monitoring");
  }

  ngDoCheck():void {
    
  }

  async table(cnpj: any): Promise<void> {
  
    if((await this.MonitoringService.getDataRegister(this.key)).config !== undefined){
      this.pasta = JSON.parse((await this.MonitoringService.getDataRegister(cnpj)).config.bancos)[0].caminhopasta;   
    }

  this.razaoSocial = ((await this.MonitoringService.getDataRegister(cnpj)).razaoSocial).toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
  this.status = (await this.MonitoringService.getDataRegister(cnpj)).status;
  this.acesso = (await this.MonitoringService.getDataRegister(cnpj)).acesso;
  this.senha = (await this.MonitoringService.getDataRegister(cnpj)).senha;
  this.qtdLoja = (await this.MonitoringService.getDataRegister(cnpj)).qtdLoja;
  this.estado = (await this.MonitoringService.getDataRegister(cnpj)).estado;
  this.so = (await this.MonitoringService.getDataRegister(cnpj)).so;
  this.observacao = (await this.MonitoringService.getDataRegister(cnpj)).observacao;
  this.email = (await this.MonitoringService.getDataRegister(cnpj)).email;
  this.telefone = (await this.MonitoringService.getDataRegister(cnpj)).telefone;
  this.responsavel = ((await this.MonitoringService.getDataRegister(cnpj)).responsavel).toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
  this.expirationDate = (await this.MonitoringService.getDataRegister(cnpj)).expirationDate;
  this.status = this.status === "1" ? "Ativo": "Cancelado";


  this.myControlsos = new FormControl(this.so);
  this.myControlstatesBrazil = new FormControl(this.estado);
  this.myControlnumbers = new FormControl(this.qtdLoja);
  this.myControlstatuss = new FormControl(this.status);
           
  }

  openDialogConfig(enterAnimationDuration: string, exitAnimationDuration: string, key: string): void {
    const dialogRef = this.dialog.open(ConfigDialogComponent, {
      width: '70rem',
      height: '65rem',
      enterAnimationDuration,
      exitAnimationDuration,
      data: key,
    });
  
    dialogRef.afterClosed().subscribe((alteration) => {
      this.banco = alteration.data;

      this.editConfig = alteration.edit;
    });
  }

  openDialogLicense(enterAnimationDuration: string, exitAnimationDuration: string, key: string): void {
    const dialogRef = this.dialog.open(LicenseDialogComponent, {
      width: '35rem',
      height: '26rem',
      enterAnimationDuration,
      exitAnimationDuration,
      data: key,
    });
  
    dialogRef.afterClosed().subscribe((alteration) => {
      this.expirationDateLicense = alteration.expirationDate;

      this.editLicense = alteration.edit;
    });
  }

  log(key: string):void{
    this.auth.navigate(`Log/${key}/1`);
  }

  async linkDropBox():Promise<void>{

    const clientId = (await this.MonitoringService.getDatatoken()).clientId;
    const dropboxAuthorizationUrl = `https://www.dropbox.com/home/VRBackup/${this.pasta}`;
      
    const newTab = this.renderer.createElement('a');
    this.renderer.setAttribute(newTab, 'href', dropboxAuthorizationUrl);
    this.renderer.setAttribute(newTab, 'target', '_blank');
    this.renderer.appendChild(document.body, newTab);
    newTab.click();
    this.renderer.removeChild(document.body, newTab);
  }
  
}
