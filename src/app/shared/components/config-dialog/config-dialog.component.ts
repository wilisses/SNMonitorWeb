import { Component, DoCheck, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MonitoringService } from '../../../service/monitoring.service';
import { AuthService } from '../../../service/auth.service';
import { NewDataBaseDialogComponent } from '../new-data-base-dialog/new-data-base-dialog.component';

export interface GetConfig {
  host: string,
  particao: string,
  pastaBin: string,
  port: string,
  bancos: any;
}

export interface Config {
  databasename: string,
  caminhodapasta: string,
  firstSchedule: string,
  secondSchedule: string
}


@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrl: './config-dialog.component.css'
})
export class ConfigDialogComponent implements DoCheck {
  displayedColumns: string[] = ['Nome do Banco', 'Caminho da Pasta', 'Primeiro Horário', 'Segundo Horário'];
  dataSource: any ;
  selectedRow: any;
  configKey: string | undefined;
  host: string = '';
  port: string = '';
  pastaBin: string = '';
  particao: string = '';
  edit: boolean = false;


  constructor(
    public auth: AuthService,
    public dialogRef: MatDialogRef<ConfigDialogComponent>,
    private MonitoringService: MonitoringService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data?: string | undefined,
    
  ) {}

  @ViewChild(MatTable) table!: MatTable<Config>;

  ngOnInit() {
    this.configKey = this.data;
    this.tableConfig(this.configKey);
  }

  ngDoCheck(): void{
    
  }

  async tableConfig(cnpj: any): Promise<void> {
    if(this.auth !== undefined){
      const bancosTable = JSON.parse(((await this.MonitoringService.getDataConfig(cnpj)).bancos));
      this.dataSource = new MatTableDataSource(bancosTable);

        this.host = (await this.MonitoringService.getDataConfig(cnpj)).host,
        this.particao = (await this.MonitoringService.getDataConfig(cnpj)).particao,
        this.pastaBin = (await this.MonitoringService.getDataConfig(cnpj)).pastaBin,
        this.port = (await this.MonitoringService.getDataConfig(cnpj)).port
    }
  }

  addData() {
    
    const dialogRef = this.dialog.open(NewDataBaseDialogComponent, {
      width: '70rem',
      height: '60rem',
    });
  
    dialogRef.afterClosed().subscribe((dados) => {
      
      this.dataSource.data.push(dados);
      this.table.renderRows();
      
    });
    
    this.change();
  }

  removeData() {
    if(this.selectedRow === undefined){
      this.auth.Alert("Por favor, selecione uma linha antes de remover.");
      return;
    }
    
    const updatedArray = this.dataSource.data.filter((obj:Config) => obj.databasename !== this.selectedRow);
    this.dataSource = new MatTableDataSource(updatedArray);
    this.table.renderRows();
    
    this.change();
  }
  

  selectRow(element: Config): void {
    this.selectedRow = element.databasename;

    console.log(this.selectedRow)
  }
  

  closeDialog(): void {
    this.dialogRef.close();
  }

  change(): void{
    this.edit = true;
  }

  async submit(): Promise<void> {
    
    const dadosconfig = {
        host: this.host,
        port: this.port,
        pastaBin: this.pastaBin,
        particao: this.particao,
        bancos: JSON.stringify(this.dataSource.data, null, 2)
    };
    
    const alteration = {
      data: dadosconfig,
      edit: this.edit,
    }
    
    this.dialogRef.close(alteration);
  
  }

}

