import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MonitoringService } from '../service/monitoring.service';
import { FormControl, FormGroup } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';

export interface Infor {
  [key: string]: {
    [date: string]: {
      shifts: {
        SizeByte?: any;
        SizeMbGb?: any;
        backup?: {
          end?: any;
          start?: any;
          erro?: any;
        };
        freeSpace?: any;
        last5Line?: any;
        lastLine?: any;
        sizeDataBase?: any;
        totalSpace?: any;
        upload?: {
          erro?: any;
          start?: any;
          end?: any;
        };
      }[];
    };
  };
}

export interface InforLog {
    [date: string]: {
      description: string;
  };
}

export interface informationLog {
  date: string;
  shifts: string;
}

export interface information {
  daterow:any;
  dataBase: any;
  date: any;
  shift: any;
  SizeByte: any;
  SizeMbGb: any;
  backup: {
    erro: any;
    start: any;
    end: any;
  };
  freeSpace: any;
  last5Line: any;
  lastLine: any;
  sizeDataBase: any;
  totalSpace: any;
  upload: {
    erro: any;
    start: any;
    end: any;
  };
}

const today = new Date();

// Ontem
const yesterday = new Date();
yesterday.setDate(today.getDate() - 7);

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrl: './log.component.css',
  providers: [provideNativeDateAdapter()],
})
export class LogComponent {
  user:any;
  key: any;
  shift: string = '';
  information: any; 
  dados: information[] = [];
  pasta: string = '';
  myControldataBases = new FormControl();

  dataBases: string[] = [];
  dataBase: string = '';
  campaignOne = new FormGroup({
    start: new FormControl(yesterday),
    end: new FormControl(today),
  });
  
  constructor(private route: ActivatedRoute, public auth: AuthService, private MonitoringService: MonitoringService, public dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    this.user = this.auth.UserAuth();
  
    this.route.params.subscribe(async (params) => {
      this.key = params['key'];
      this.shift = params['shift'];
      if (this.user) {
        try {

          if((await this.MonitoringService.getDataRegister(this.key)).config !== undefined){
            this.pasta = JSON.parse((await this.MonitoringService.getDataRegister(this.key)).config.bancos)[0].caminhopasta;   
          }

          this.information = await this.MonitoringService.getDataInformation(this.key);

          const nomesBancos = Object.keys(this.information);
          const termos = Array.isArray(nomesBancos) ? nomesBancos.join(',') : nomesBancos;
          const termosArray = termos.split(',');
          const termosFiltrados = termosArray.filter(item => item !== 'statusApp');
          this.myControldataBases = new FormControl(termosFiltrados[0]);
          this.changedataBase(termosFiltrados[0]);

          
          this.dataBases.push(...termosFiltrados);
            
        } catch (error) {
          console.error('Erro ao obter informações:', error);
        }
      } else {
        this.auth.navigate("");
      }
    });
  }
  
  changedataBase(dataBase: string): void {
    
    this.dados = [];
    const startDate = this.campaignOne.get('start')?.value;
    const formattedStartDate = startDate ? this.auth.formatDate7(startDate) : '';

    // Obtém a data final selecionada
    const endDate = this.campaignOne.get('end')?.value;
    const formattedEndDate = endDate ? this.auth.formatDate7(endDate) : '';

    const shifts: information[] = [];
    if (this.information) {
      
      if (dataBase in this.information) {
        
        for (const date of Object.keys(this.information[dataBase] || {})) {
          const currentDate = new Date(date);

          if (
            formattedStartDate &&
            formattedEndDate &&
            currentDate >= (new Date(formattedStartDate)) &&
            currentDate <= (new Date(formattedEndDate))
          ) {
          if (this.information[dataBase][date]?.shifts) {
              let row = 0;
              
              for (const shift of this.information[dataBase][date].shifts) {
                
                if (typeof shift === 'object' && shift !== null) {

                  const shiftData: information = {
                    daterow: date,
                    dataBase: dataBase,
                    date: this.auth.formatDate6(date),
                    shift: row,
                    SizeByte: shift?.SizeByte,
                    SizeMbGb: shift?.SizeMbGb,
                    backup: {
                      erro: shift?.backup?.erro,
                      start: shift?.backup?.start,
                      end: shift?.backup?.end,
                    },
                    freeSpace: shift?.freeSpace,
                    last5Line: shift?.last5Line,
                    lastLine: shift?.lastLine,
                    sizeDataBase: shift?.sizeDataBase,
                    totalSpace: shift?.totalSpace,
                    upload: {
                      erro: shift?.upload?.erro,
                      start: shift?.upload?.start,
                      end: shift?.upload?.end,
                    },
                  };
                  shifts.push(shiftData);
                  row++;
                }
              }
            }
          }
        }
      }
    }
    shifts.sort((a, b) => {
      const dateComparison = new Date(b.daterow).getTime() - new Date(a.daterow).getTime();
      
      if (dateComparison === 0) {
        return b.shift - a.shift;
      }
      return dateComparison;
    });
    
    //shifts.reverse();

    this.dados = [...this.dados, ...shifts];

  }

  calcularDiferencaTempo(inicio: string, termino: string): string {

    if (!inicio || !termino) {
      return ''; // ou outra mensagem de erro adequada
    }

    // Converte as datas para objetos Date
    const dataInicio = new Date(inicio.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6'));
    const dataTermino = new Date(termino.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6'));
  
    // Calcula a diferença em milissegundos
    const diferencaEmMilissegundos = dataTermino.getTime() - dataInicio.getTime();
  
    // Calcula horas, minutos e segundos
    const segundos = Math.floor(diferencaEmMilissegundos / 1000);
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
  
    // Formata o resultado
    const formatoHora = (valor: number) => (valor < 10 ? `0${valor}` : valor.toString());
    const resultado = `${horas}:${formatoHora(minutos)}:${formatoHora(segundosRestantes)}`;
  
    return resultado;
  }
 
  signOut():void {
    if(this.shift === '0'){
      this.auth.navigate("Monitoring");
    } else if(this.shift === '1'){
      this.auth.navigate(`Register/${this.key}`);
    }
    
  }

  somarHoras(hora1: any, hora2: any) {
      // Converter as horas para segundos
     
      const segundos1 = this.converterParaSegundos(hora1);
      const segundos2 = this.converterParaSegundos(hora2);

      // Somar os segundos
      const totalSegundos = segundos1 + segundos2;

      // Calcular horas, minutos e segundos a partir do total de segundos
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;

      // Formatando a saída
      let resultado
      if(hora1 === "" || hora2 === ""){
        if(hora1 === ""){
          resultado = hora2;
        } else {
          resultado = hora1;
        }
      } else {
        resultado = `${this.formatarNumero(horas)}:${this.formatarNumero(minutos)}:${this.formatarNumero(segundos)}`;
      }
      return resultado;
  }

  // Função auxiliar para converter horas no formato "hh:mm:ss" para segundos
  converterParaSegundos(hora: any) {
      const partes = hora.split(':');
      return parseInt(partes[0]) * 3600 + parseInt(partes[1]) * 60 + parseInt(partes[2]);
  }

  // Função auxiliar para formatar números menores que 10 com zero à esquerda
  formatarNumero(numero: any) {
      return numero < 10 ? `0${numero}` : numero;
  }

  
}
