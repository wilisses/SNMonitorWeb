import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MonitoringService } from '../service/monitoring.service';
import { FormControl } from '@angular/forms';

export interface BackupInfo {
  SizeByte: string;
  SizeMbGb: string;
  backup: {
    end: string;
    start: string;
  };
  freeSpace: string;
  last5Line: string;
  lastLine: string;
  totalSpace: string;
  upload: {
    end: string;
    start: string;
    erro?: string; 
  };
  sizeDataBase?: string; 
}

export interface Shift {
  [date: string]: BackupInfo[];
}

export interface Infor {
  [key: string]: {
    shifts: Shift[];
  };
}

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrl: './log.component.css'
})
export class LogComponent {
  user:any;
  key: any;

  myControldataBases = new FormControl('');
  myControldates = new FormControl('');

  dataBases: string[] = [];
  dataBase: string = '';
  dates: string[] = [];
  date: string = '';
  constructor(private route: ActivatedRoute, public auth: AuthService, private MonitoringService: MonitoringService, public dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    this.user = this.auth.UserAuth();
  
    this.route.params.subscribe(async (params) => {
      this.key = params['key'];
      if (this.user) {
        try {
          const item = await this.MonitoringService.getDataInformation(this.key);
          console.log(item);
          const nomesBancos = Object.keys(item);
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
    console.log(dataBase);
    this.route.params.subscribe(async (params) => {
      this.key = params['key'];
      if (this.user) {
        try {
          const item = await this.MonitoringService.getDataInformation(this.key);
          console.log(item)
          const dates = Object.keys(item[dataBase]);
          const formattedDates = dates.map(date => {
            const [year, month, day] = date.split('-');
            return `${day}/${month}/${year}`;
          });
          this.dates = formattedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        } catch (error) {
          console.error('Erro ao obter informações:', error);
        }  
             
      } else {
        this.auth.navigate("");
      }
    });
  }

  // changedataBase(dataBase: string): void {
  //   console.log(dataBase);
  //   this.dates = [];
  //   this.route.params.subscribe(async (params) => {
  //     this.key = params['key'];
  //     if (this.user) {
  //       try {
  //         const item = await this.MonitoringService.getDataInformation(this.key);
  //         console.log(item)
  //         const dates = Object.keys(item[dataBase]);
  //         const formattedDates = dates.map(date => {
  //           const [year, month, day] = date.split('-');
  //           return `${day}/${month}/${year}`;
  //         });
  //         this.dates = formattedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  //       } catch (error) {
  //         console.error('Erro ao obter informações:', error);
  //       }        
  //     } else {
  //       this.auth.navigate("");
  //     }
  //   });
  // }
 
  signOut():void {
    this.auth.navigate("Monitoring");
  }
  
}
