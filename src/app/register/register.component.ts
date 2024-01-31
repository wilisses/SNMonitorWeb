import { Component, DoCheck, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormControl } from '@angular/forms';
import { MonitoringService } from '../service/monitoring.service';
import { ConfigDialogComponent, GetConfig } from '../shared/components/config-dialog/config-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  bancos: any;
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
  bancos: GetConfig[] = [];
  edit: boolean = false;
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

  constructor(private route: ActivatedRoute, public auth: AuthService, private MonitoringService: MonitoringService,public dialog: MatDialog) {}

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
    


    
    const bancos = (await this.MonitoringService.getDataConfig(this.key)).bancos;
    const host = (await this.MonitoringService.getDataConfig(this.key)).host;
    const particao = (await this.MonitoringService.getDataConfig(this.key)).particao;
    const pastaBin = (await this.MonitoringService.getDataConfig(this.key)).pastaBin;
    const port = (await this.MonitoringService.getDataConfig(this.key)).port;

    const dadosconfig = {
      host: host,
      port: port,
      pastaBin: pastaBin,
      particao: particao,
      bancos: bancos
    };
  
    //console.log(razaoSocial,status,key,email,responsavel,telefone,acesso,senha,qtdLoja,estado,so,observacao);

    this.register = {
      razaoSocial: this.razaoSocial,
      status: this.status,
      email: this.email,
      responsavel: this.responsavel,
      telefone: this.telefone,
      acesso: this.acesso,
      senha: this.senha,
      qtdLoja: this.qtdLoja,
      estado: this.estado,
      so: this.so,
      observacao: this.observacao,
      bancos: this.edit ? this.bancos : dadosconfig,
    };
      
    try {
      await this.MonitoringService.updateRegister(this.key, this.register);
      this.auth.Alert("Salvo com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar o registro:', error);
    }

  }

  signOut():void {
    this.auth.navigate("Monitoring");
  }

  ngDoCheck():void {
    
  }

  async table(cnpj: any): Promise<void> {
   
  this.razaoSocial = (await this.MonitoringService.getDataRegister(cnpj)).razaoSocial;
  this.status = (await this.MonitoringService.getDataRegister(cnpj)).status;
  this.acesso = (await this.MonitoringService.getDataRegister(cnpj)).acesso;
  this.senha = (await this.MonitoringService.getDataRegister(cnpj)).senha;
  this.qtdLoja = (await this.MonitoringService.getDataRegister(cnpj)).qtdLoja;
  this.estado = (await this.MonitoringService.getDataRegister(cnpj)).estado;
  this.so = (await this.MonitoringService.getDataRegister(cnpj)).so;
  this.observacao = (await this.MonitoringService.getDataRegister(cnpj)).observacao;
  this.email = (await this.MonitoringService.getDataRegister(cnpj)).email;
  this.telefone = (await this.MonitoringService.getDataRegister(cnpj)).telefone;
  this.responsavel = (await this.MonitoringService.getDataRegister(cnpj)).responsavel;
    
  const bancos = JSON.parse(((await this.MonitoringService.getDataConfig(cnpj)).bancos));
  this.pasta = bancos[0].caminhopasta;

  this.myControlsos = new FormControl(this.so);
  this.myControlstatesBrazil = new FormControl(this.estado);
  this.myControlnumbers = new FormControl(this.qtdLoja);
  this.myControlstatuss = new FormControl(this.status === "1" ? 'Ativo': 'Cancelado');
           
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, key: string): void {
    const dialogRef = this.dialog.open(ConfigDialogComponent, {
      width: '70rem',
      height: '60rem',
      enterAnimationDuration,
      exitAnimationDuration,
      data: key,
    });
  
    dialogRef.afterClosed().subscribe((alteration) => {
      this.bancos = alteration.data;
      this.edit = alteration.edit;
    });
  }
  
}
