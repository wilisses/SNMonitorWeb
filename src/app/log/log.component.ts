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

export interface information {
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
@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrl: './log.component.css',
  providers: [provideNativeDateAdapter()],
})
export class LogComponent {
  user:any;
  key: any;

  information: any; 
  dados: information[] = [];

  myControldataBases = new FormControl('');

  dataBases: string[] = [];
  dataBase: string = '';
  campaignOne = new FormGroup({
    start: new FormControl(today),
    end: new FormControl(today),
  });
  
  constructor(private route: ActivatedRoute, public auth: AuthService, private MonitoringService: MonitoringService, public dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    this.user = this.auth.UserAuth();
  
    this.route.params.subscribe(async (params) => {
      this.key = params['key'];
      if (this.user) {
        try {
          this.information = await this.MonitoringService.getDataInformation(this.key);

            const nomesBancos = Object.keys(this.information);
            this.dataBases.push(...nomesBancos);
         
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
      // Ordenar por data em ordem decrescente
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      
      if (dateComparison === 0) {
        // Se as datas forem iguais, ordenar por turno em ordem decrescente
        return b.shift - a.shift;
      }
    
      // Ordenar por data em ordem decrescente
      return dateComparison;
    });
    
    // Inverter a ordem dos shifts após a ordenação
    shifts.reverse();

    this.dados = [...this.dados, ...shifts];
  }
  
 
  signOut():void {
    this.auth.navigate("Monitoring");
  }
  
}
