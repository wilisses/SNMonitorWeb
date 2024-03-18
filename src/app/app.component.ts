import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from './service/auth.service';
import { MonitoringService } from './service/monitoring.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent implements OnInit {
  title = 'SNMonitor';
  expiration: any;
  constructor(public auth: AuthService,private MonitoringService: MonitoringService){}
  @HostListener('window:beforeunload', ['$event'])
  async beforeUnloadHandler(event: any) {
    await this.auth.signOut();
    window.location.href = '/';
  }
  async ngOnInit(): Promise<void> {
      
      //this.auth.navigate("");
      const expirationDate = (await this.MonitoringService.getDatatoken()).expirationDate;
      setInterval(() => {
      this.expiration = this.auth.updateTimeRemaining(expirationDate);
     
      // let expira = `${this.expiration.split(' ')[0].replace('d','')+this.expiration.split(' ')[1].replace('h','')+this.expiration.split(' ')[2].replace('m','')+this.expiration.split(' ')[3].replace('s','')}`;
      
      //  if(expira < '01059' && expira < '01059'){
      //   alert("Atenção: O token expirará em breve!");
      //  }

       }, 1000);
      
  }
}
