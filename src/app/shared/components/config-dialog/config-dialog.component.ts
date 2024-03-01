import { Component, DoCheck, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MonitoringService } from '../../../service/monitoring.service';
import { AuthService } from '../../../service/auth.service';
import { NewDataBaseDialogComponent } from '../new-data-base-dialog/new-data-base-dialog.component';
import { DropboxService } from '../../../service/dropbox.service';

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
  dataSource: any = [];
  selectedRow: any;
  configKey: string | undefined;
  host: string = '';
  port: string = '';
  pastaBin: string = '';
  particao: string = '';
  expiration: string = '';
  access: any = '';
  edit: boolean = false;
  senhaVisivel: boolean = false;
  constructor(
    public auth: AuthService,
    public dropBox: DropboxService,
    public dialogRef: MatDialogRef<ConfigDialogComponent>,
    private MonitoringService: MonitoringService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data?: string | undefined
  ) {}

  @ViewChild(MatTable) table!: MatTable<Config>;

  ngOnInit() {
    
    this.configKey = this.data;
   
    this.tableConfig(this.configKey);
  }

  ngDoCheck(): void{
    
  }

  alternarVisibilidadeSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  async geraToken(): Promise<any> {
    this.change();
    try {
      const tokenInfo = await this.dropBox.obterToken();
      this.expiration = this.auth.formatDate5(tokenInfo.expiration);
      this.access = tokenInfo.accesstoken;
    } catch (error) {
      console.error('Erro ao gerar o token:', error);
    }
  }
  

  async tableConfig(cnpj: any): Promise<void> {
    if(this.auth !== undefined){
        const bancosTable = ((await this.MonitoringService.getDataRegister(cnpj)).config);
      
        if((await this.MonitoringService.getDataRegister(cnpj)).config){
          
          this.dataSource = new MatTableDataSource(JSON.parse(bancosTable.bancos));
          this.host = (await this.MonitoringService.getDataRegister(cnpj)).config.host,
          this.particao = (await this.MonitoringService.getDataRegister(cnpj)).config.particao,
          this.pastaBin = (await this.MonitoringService.getDataRegister(cnpj)).config.pastaBin,
          this.port = (await this.MonitoringService.getDataRegister(cnpj)).config.port,
          this.expiration = (await this.MonitoringService.getDataRegister(cnpj)).config.expirationAccess,
          this.access = (await this.MonitoringService.getDataRegister(cnpj)).config.token_access
  
          this.expiration = this.auth.formatDate5(this.expiration);
        }

    }
  }

  editData() {

    if(this.selectedRow === undefined){
      this.auth.Alert("Por favor, selecione uma linha antes de remover.", 3000);
      return;
    }

    const dialogRef = this.dialog.open(NewDataBaseDialogComponent, {
      width: '70rem',
      data:this.selectedRow,
    });
  
    dialogRef.afterClosed().subscribe((dados) => {
      
      if(dados.edit){
        const updatedArray = this.dataSource.data.filter((obj:Config) => obj.databasename !== this.selectedRow.databasename);
        this.dataSource = new MatTableDataSource(updatedArray);
        if(this.dataSource.length === 0){
          this.dataSource = new MatTableDataSource([dados.dados]);
        } else {
          this.dataSource.data.push(dados.dados);
        }
        this.table.renderRows();
      }
    });
    
    this.change();
  }

  addData() {
    
    const dialogRef = this.dialog.open(NewDataBaseDialogComponent, {
      width: '70rem',
    });
  
    dialogRef.afterClosed().subscribe((dados) => {
     
      if(this.dataSource.length === 0){
        this.dataSource = new MatTableDataSource([dados.dados]);
      } else {
        this.dataSource.data.push(dados.dados);
      }
      this.table.renderRows();
      
    });
    
    this.change();
  }

  removeData() {
    if(this.selectedRow.databasename === undefined){
      this.auth.Alert("Por favor, selecione uma linha antes de remover.", 3000);
      return;
    }
    
    const updatedArray = this.dataSource.data.filter((obj:Config) => obj.databasename !== this.selectedRow.databasename);
    this.dataSource = new MatTableDataSource(updatedArray);
    this.table.renderRows();
    
    this.change();
  }
  

  selectRow(element: Config): void {

    this.selectedRow = element;
    selectRow(this.selectedRow.databasename);

    function selectRow(rowId: any) {
      var tableRow = document.getElementById(rowId);
  
      if (tableRow) {
          tableRow.style.backgroundColor = 'var(--primary-color)';
         
      } 
    }
  }
  
  closeDialog(): void {
    this.dialogRef.close();
  }

  change(): void{
    this.edit = true;
  }

  async submit(): Promise<void> {

    const partes = this.expiration.split(' ');
    const horaParte = partes[0];
    const dataParte = partes[1];

    const dataHoraFormatada = `${dataParte.split('/').reverse().join('-')}T${horaParte}.000`;
  
    const dadosconfig = {
        host: this.host,
        port: this.port,
        pastaBin: this.pastaBin,
        particao: this.particao,
        bancos: JSON.stringify(this.dataSource.data, null, 2),
        token_access: this.access,
        expirationAccess:dataHoraFormatada,
    };
    
    const alteration = {
      data: dadosconfig,
      edit: this.edit,
    }
    
    this.dialogRef.close(alteration);
  
  }

}

