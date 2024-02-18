import { Component, DoCheck, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { MonitoringService } from '../service/monitoring.service';
import { AuthService } from '../service/auth.service';
import { DropboxService } from '../service/dropbox.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { PendingDialogComponent } from '../shared/components/pending-dialog/pending-dialog.component';
import { ConfigDropboxDialogComponent } from '../shared/components/config-dropbox-dialog/config-dropbox-dialog.component';

interface Banco {
  databasename: string;
  caminhopasta: string;
  firstSchedule: string;
  secondSchedule: string;
}
export interface DropBoxEntry {
  server_modified: any;
  name: any;
  client_modified: any;
  size: any;
}

export interface Token{
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  tokenEndpoint: string;
  remetente: string;
  passwordRemetente: string;
  destinatarios: any;
  expirationDate: any;
}

export interface Monitoring{
    checked: any;
    sign:any;
    percentage:any;
    row: any;
    key: any;
    caminhoPasta: any;
    nameDataBase: any;
    status: any;
    dateCurrent: any;
    datePrevious: any;
    sizeCurrent: any;
    sizePrevious: any;
    nameCurrent: any;
    namePrevious: any;
}

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.css',
})
export class MonitoringComponent implements OnInit , DoCheck{
  licenses: any[] = [];
  displayedColumns: string[] = [
    'codigo',
    '%',
    'caminhoPasta',
    'dateCurrent',
    'status',
    'nameCurrent',
    'sizeCurrent',
    'namePrevious',
    'sizePrevious',
  ];
  dataSource: any ;
  filterValue: any;
  isChecked: boolean = false;
  user: any;
  constructor(public auth: AuthService , private MonitoringService: MonitoringService,private dropboxService: DropboxService,public dialog: MatDialog){}
  
  async ngOnInit(): Promise<void> {

   this.user = this.auth.UserAuth();

    if(this.user && await this.dropboxService.obterToken()){
      this.table()
      .then(async result => {
        this.dataSource = new MatTableDataSource(result);
      })
      .catch(error => {
        console.error(error);
      });
    } else {
      this.auth.navigate("");
    }
  }

  async refresh():Promise<void>{
    
    if(this.user && await this.dropboxService.obterToken()){
      this.table()
      .then(async result => {
        this.dataSource = new MatTableDataSource(result);
      })
      .catch(error => {
        console.error(error);
      });
    } else {
      this.auth.navigate("");
    }

  }
  
  ngDoCheck(): void {
    if (this.dataSource) {
      if (this.filterValue === undefined || this.filterValue === "") {
        this.dataSource.filter = null;
      }
    }
  }
  

  rowClicked(key: any): void {
    this.auth.navigate(`Register/${key}`);
  }
  rowClickedPending(key: any): void {
    const dialogRef = this.dialog.open(PendingDialogComponent, {
      width: '35rem',
      height: '40rem',
      data: key,
    });
  
  }

  change(element: any): void {
    
    const listaCNPJs = this.obterListaCNPJs();

    this.adicionarCNPJNaLista(listaCNPJs, element.key);

  }
  

  checkboxChanged(){
      this.table()
      .then(async result => {
        this.dataSource = new MatTableDataSource(result);
      })
      .catch(error => {
        console.error(error);
      });
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }

  async table(): Promise<Monitoring[]> {
    return new Promise<Monitoring[]>((resolve, reject) => {
        this.MonitoringService.getDataLincese().subscribe((dados) => {
          this.licenses = dados;

          const listaMonitoramento: Monitoring[] = [];
          let row = 1;
          this.licenses.forEach(item => {
            if (item.config && item.config.bancos) {
              let bancosArray: Banco[] = JSON.parse(item.config.bancos);
              let pastas: string[] = [];
              
              bancosArray.forEach(async banco => {
                let caminhoPasta: string = banco.caminhopasta;
                if(item.status === "1"){
                  if(!pastas.includes(caminhoPasta) && caminhoPasta !== 'Licenca encerrada'){
                    
                    this.dropBox(caminhoPasta)
                    .then(result => {
                      const bancos: Record<string, DropBoxEntry[]> = {};
                      result.forEach(item => {
                        const regex = /_(.*?)\.(backup|json)/;
                        const correspondencias = regex.exec(item.name);
                        if (correspondencias && correspondencias.length > 1) {
                          const nomeDoBanco = correspondencias[1];
                  
                          if (!bancos[nomeDoBanco]) {
                            bancos[nomeDoBanco] = [];
                          }
                          bancos[nomeDoBanco].push(item);
                        }
                      });
                      
                     
                      let nameDataBase: string | null = null;
                      
                      Object.keys(bancos).forEach(nomeDoBanco => {
                        const arquivosDoBanco = bancos[nomeDoBanco];
                        nameDataBase = nomeDoBanco;
                        
                        const arquivosOrdenados = arquivosDoBanco.sort((a, b) => {
                          return new Date(b.server_modified).getTime() - new Date(a.server_modified).getTime();
                        });

                        const ultimosDoisArquivos = arquivosOrdenados.slice(0, 2);

                        let dateCurrent: string | null = null;
                        let datePrevious: string | null = null;
                        let sizeCurrent: number | null = null;
                        let sizePrevious: number | null = null;
                        let nameCurrent: string = '';
                        let namePrevious: string = '';
                        let key = item.key;
                        ultimosDoisArquivos.forEach((item,index) => {
                          let datearquivo = item.name.split('_');

                          if(index === 0){
                            sizeCurrent = item.size;
                            nameCurrent = item.name;
                            
                            if (datearquivo[0].length !== 8) {
                                dateCurrent = this.auth.formatDate2(item.server_modified);
                            } else {
                                dateCurrent = this.auth.formatDate1(datearquivo[0]);
                            }
                          
                          } else {
                            sizePrevious = item.size;
                            namePrevious = item.name;

                            if (datearquivo[0].length !== 8) {
                              
                              datePrevious = this.auth.formatDate2(item.server_modified);
                            } else {
                              
                              datePrevious = this.auth.formatDate1(datearquivo[0]);
                            }
                          }
                        });
                        
                        const status = this.status(sizeCurrent, sizePrevious, dateCurrent);
                        
                        const listaCNPJs = this.obterListaCNPJs();
    
                        const estaNaLista = verificarCNPJNaLista(listaCNPJs, key);
                        
                        let ischecked: boolean = false;
                        if (estaNaLista) {
                          ischecked = true;
                        } else {
                          ischecked = false;
                        }
                        let returnpercentage = calculatepercentage(sizePrevious, sizeCurrent);
                     
                        if(nameCurrent.split('_')[1].split('.')[0] === "newcompany"){
                          listaMonitoramento.push({
                            checked:ischecked,
                            sign: returnpercentage.sign,
                            percentage: returnpercentage.percentage,
                            row,
                            key,
                            caminhoPasta,
                            nameDataBase,
                            status: "Novo",
                            dateCurrent,
                            datePrevious: null,
                            sizeCurrent:this.auth.formatSize1(null),
                            sizePrevious:this.auth.formatSize1(null),
                            nameCurrent: null,
                            namePrevious: null
                          });
                        } else {

                          if(this.isChecked){
                            if(status !== "OK"){
                              listaMonitoramento.push({
                                checked:ischecked,
                                sign: returnpercentage.sign,
                                percentage: returnpercentage.percentage,
                                row,
                                key,
                                caminhoPasta,
                                nameDataBase,
                                status: status,
                                dateCurrent,
                                datePrevious,
                                sizeCurrent:this.auth.formatSize1(sizeCurrent),
                                sizePrevious:this.auth.formatSize1(sizePrevious),
                                nameCurrent,
                                namePrevious
                              });
                          }
                          } else {
                            listaMonitoramento.push({
                              checked:ischecked,
                              sign: returnpercentage.sign,
                              percentage: returnpercentage.percentage,
                              row,
                              key,
                              caminhoPasta,
                              nameDataBase,
                              status: status,
                              dateCurrent,
                              datePrevious,
                              sizeCurrent:this.auth.formatSize1(sizeCurrent),
                              sizePrevious:this.auth.formatSize1(sizePrevious),
                              nameCurrent,
                              namePrevious
                            });
                          }
                        } 
                        
                        row = row+1;
                      });
                    })
                    .catch(error => {
                      console.error(caminhoPasta, error);
                    });

                    pastas.push(caminhoPasta);
                  }
                }
                
              });
            }
          });

          resolve(listaMonitoramento);
        }, error => {
          console.error('Erro ao obter dados de licença', error);
          reject(error);
        });
      
    });

    function verificarCNPJNaLista(listaCNPJs: string, cnpjProcurado: string): boolean {
      const lista = listaCNPJs.split(',').map(cnpj => cnpj.trim()); // Divide a lista em um array
      return lista.includes(cnpjProcurado); // Verifica se o CNPJ procurado está na lista
    }

    function calculatepercentage(sizePrevious: any, sizeCurrent: any): any {

      const subtract = (sizeCurrent ? sizeCurrent : 0) - (sizePrevious ? sizePrevious : 0);

      const calculation = ((subtract) * 100) / (sizeCurrent ? sizeCurrent : 0);
      const sign = subtract >= 0 ? "+" : "-";

      const res = {
        percentage: `${calculation.toFixed(2).replace('.', ',')} %`,
        sign: sign,
      }

      return res;
  }
    
  }

  getColorStyle(element: any): any {
    if(element.percentage === '0,00 %') {
      return { color: 'black' };
    } else if (element.sign === '+') {
      return { color: 'green' };
    } else if (element.sign === '-') {
      return { color: 'red' };
    } else {
      return { color: 'black' };
    }
  }

  status(sizeCurrent: any, sizePrevious: any, dateCurrent: any): any{
    let status;
    const dataAtual = new Date();
    const dataAnterior = new Date(dataAtual);
    dataAnterior.setDate(dataAtual.getDate() - 1);

    // Formatando as datas como strings (opcional)
    const formatoData = { year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const stringDataAtual = dataAtual.toLocaleDateString('pt-BR', formatoData);
    const stringDataAnterior = dataAnterior.toLocaleDateString('pt-BR', formatoData);

    if(this.auth.formatDate3(dateCurrent) === this.auth.formatDate3(stringDataAtual) || this.auth.formatDate3(dateCurrent) === this.auth.formatDate3(stringDataAnterior)){
      if(sizeCurrent === 0){
        status = "Zerado";
      } else if( sizePrevious > sizeCurrent){
        status = "Reduzido";
      } else {
        status = "OK";
      }
    } else {
      status = "Não Subiu";
    }

    return status;
  }

  async dropBox(caminhoDropbox: string): Promise<DropBoxEntry[]> {
    try {
      const result = await this.dropboxService.listarArquivos(`/VRBackup/${caminhoDropbox}`);

      const results: DropBoxEntry[] = result.entries
      .map(item => ({
        server_modified: item[".tag"] === "file" && item.server_modified,
        name: item.name,
        client_modified: item[".tag"] === "file" && item.client_modified,
        size: item[".tag"] === "file" && item.size,
      }));
      return results;
    } catch (error) {

     // console.error(error);
      
      const dataAtual = new Date();
      const dataAtualFormatada = `${dataAtual.getFullYear()}-${this.padZero(dataAtual.getMonth() + 1)}-${this.padZero(dataAtual.getDate())}T${this.padZero(dataAtual.getHours())}:${this.padZero(dataAtual.getMinutes())}:${this.padZero(dataAtual.getSeconds())}Z`;
    
      return [ 
        {
          server_modified: dataAtualFormatada,
          name: '20240204_newcompany.backup',
          client_modified: dataAtualFormatada,
          size: 0
        }
      ];
    }
    
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  async perfil(): Promise<void> {
    try {
      this.auth.navigate(`User/Perfil/${this.user.uid}`);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
    }
  }

  async passwordNew(): Promise<void> {
    try {
      this.auth.navigate(`User/Password/${this.user.uid}`);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
    }
  }
  
  config():void{
    const dialogRef = this.dialog.open(ConfigDropboxDialogComponent, {
      width: '35rem',
      height: '45rem',
      data: null,
    });
  }

  addCompany():void{
    try {
      this.auth.navigate(`Register`);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
    }
  }
  addUser():void{
    try {
      this.auth.navigate(`User`);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
    }
  }

  adicionarCNPJNaLista(listaCNPJs: string, novoCNPJ: string): string {
    const lista = listaCNPJs.split(',').map(cnpj => cnpj.trim());
  
    if (!lista.includes(novoCNPJ)) {
      lista.push(novoCNPJ);
  
      localStorage.setItem('listaCNPJs', lista.join(','));
  
      return '';
    } else {
      this.removerCNPJDaLista(listaCNPJs, novoCNPJ);
      return '';
    }
  }

  obterListaCNPJs(): string {
    return localStorage.getItem('listaCNPJs') || '';
  }

  removerCNPJDaLista(listaCNPJs: string, cnpjRemover: string): string {
    const lista = listaCNPJs.split(',').map(cnpj => cnpj.trim());
  
    const index = lista.indexOf(cnpjRemover);
    if (index !== -1) {
      lista.splice(index, 1);
  
      localStorage.setItem('listaCNPJs', lista.join(','));
  
      return '';
    } else {
      return '';
    }
  }
 
}


