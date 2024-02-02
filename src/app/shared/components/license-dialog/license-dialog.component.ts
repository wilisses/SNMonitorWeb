import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MonitoringService } from '../../../service/monitoring.service';
@Component({
  selector: 'app-license-dialog',
  templateUrl: './license-dialog.component.html',
  styleUrl: './license-dialog.component.css'
})
export class LicenseDialogComponent implements OnInit {
  expiration: any;
  selecionarTipo: string = '';
  key: any;
  edit: boolean = false;
  constructor(
    public auth: AuthService,
    public dialogRef: MatDialogRef<LicenseDialogComponent>,
    private MonitoringService: MonitoringService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data?: string | undefined,
    
  ) {}
  
  async ngOnInit(): Promise<void> {
    this.key = this.data;
    this.expiration = this.auth.formatDate6((await this.MonitoringService.getDataRegister(this.key)).expirationDate);
  }

  submit(){
    const alteration = {
      expirationDate: this.auth.formatDate3(this.expiration),
      edit: this.edit,
    }

    this.dialogRef.close(alteration);
  }

  change(tipo: any){
    this.edit = true;

    if(tipo === "mes"){

      // Adicionar 1 mês à data de hoje
      const hoje = new Date();
      const umMesDepois = new Date(hoje);
      umMesDepois.setMonth(hoje.getMonth() + 1);
      
      this.expiration = this.auth.formatDate2(umMesDepois.toISOString());

    } else {
          // Adicionar 1 ano à data de hoje
      const hoje = new Date();
      const umAnoDepois = new Date(hoje);
      umAnoDepois.setFullYear(hoje.getFullYear() + 1);

      this.expiration = this.auth.formatDate2(umAnoDepois.toISOString());

    }




  }

}
