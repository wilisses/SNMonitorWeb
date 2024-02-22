import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MonitoringService } from './monitoring.service';
import { EmailService } from './email.service';
import { Send } from '../monitoring/monitoring.component';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: any;
  error: any;
  userAuth: any;
  constructor(public auth: AngularFireAuth,
    private router: Router,
    private MonitoringService: MonitoringService,
    private emailService: EmailService,
    private _snackBar: MatSnackBar) { }

  async emailSingin(email: string, password:string){
    try {
      const credential = await this.auth.signInWithEmailAndPassword(email, password);
      this.user = credential.user?.displayName;
      if(this.user !== undefined){
        const inputString: any = credential.user?.displayName;
        const parts = inputString.split(' - ');
        
        this.userAuth = {
          name : parts[0],
          role : parts[1],
          email: credential.user?.email,
          uid: credential.user?.uid,
          user: credential.user,
        }

        const userString = JSON.stringify(this.userAuth);
        localStorage.setItem('User', userString);

        this.navigate("Monitoring");
      }
    } catch (error) {
      this.error = error;
    }
  }

  UserAuth(): any {
    let userFromLocalStorage: any = null;
    const valor = localStorage.getItem('User');
    if (valor !== null) {
      userFromLocalStorage = JSON.parse(valor);
    }
    return userFromLocalStorage;
  }

  async signUp(email: string, password:string, passwordNewConfirm: string, name: string, role: string){
    
    if(password === passwordNewConfirm){
      try {
        const credential = await this.auth.createUserWithEmailAndPassword(email, password);

        await credential.user?.updateProfile({
          displayName: `${name} - ${role}`,
        });

        if(this.user !== undefined){
        const inputString: any = credential.user?.displayName;
        const parts = inputString.split(' - ');
        
        this.userAuth = {
          name : parts[0],
          role : parts[1],
          email: credential.user?.email,
          uid: credential.user?.uid,
          user: credential.user,
        }

        const userString = JSON.stringify(this.userAuth);
        localStorage.setItem('User', userString);

          this.Alert("Salvo com Sucesso!!");
        }
      } catch (error) {
        this.error = error;
      }

    } else {
      this.Alert("A nova senha não foi digitada corretamente!");
    }
  }

  async signUpdate(name: string, role: string){
    try {
      
      const user = await this.auth.currentUser;

      await user?.updateProfile({
        displayName: `${name} - ${role}`,
      });
      
      const inputString: any = user?.displayName;
      const parts = inputString.split(' - ');
      
      this.userAuth = {
        name : parts[0],
        role : parts[1],
        email: user?.email,
        uid: user?.uid,
        user: user,
      }

      const userString = JSON.stringify(this.userAuth);
      localStorage.setItem('User', userString);

      this.Alert("Salvo com Sucesso!!");

    } catch (error) {
      this.error = error;
    }
  }

  async changePassword(email: string, password:string, passwordNew: string, passwordNewConfirm: string){
    try {
      const credential = await this.auth.signInWithEmailAndPassword(email, password);
   
      if(credential.user?.displayName !== undefined){
        if(passwordNew === passwordNewConfirm){
          await credential.user?.updatePassword(passwordNew);
          
          this.Alert("Salvo com Sucesso!!");
        } else {
          this.Alert("A nova senha não foi digitada corretamente!");
        }
      } else {
        this.Alert("A senha atual está incorreta!");
      }

    } catch (error) {
      
      this.Alert("A senha atual está incorreta!");
      this.error = error;
    }
  }

  async deleteUser() {
    try {
      const user = await this.auth.currentUser;

      if (user) {
        // Deleta o usuário
        await user.delete();
        console.log('Usuário deletado com sucesso.');
      } else {
        console.error('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  }

  async googleSinin(){
    try{
      const provider = new firebase.auth.GoogleAuthProvider();
      const credential = await this.auth.signInWithPopup(provider);
      
      if(this.user !== undefined){
        const inputString: any = credential.user?.displayName;
        const parts = inputString.split(' - ');
        
        this.userAuth = {
          name : parts[0],
          role : parts[1],
          email: credential.user?.email,
          uid: credential.user?.uid,
          user: credential.user,
        }
        
        const userString = JSON.stringify(this.userAuth);
        localStorage.setItem('User', userString);

        this.navigate("Monitoring");
      }
    } catch (error){
      this.error = error;
    }
  }
  async signOut() {
    try {
      await this.auth.signOut();
      this.user = null;
      localStorage.removeItem('User');
      localStorage.removeItem('listaCNPJs');
      this.navigate("");
    } catch (error) {
      this.error = error;
    }
  }
  navigate(path:string) {
    this.router.navigate([`/${path}`]);
  }

  Alert(mensagem: string): void {
    this._snackBar.open(mensagem, 'Fechar', {
      duration: 3000, 
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  formatDate1(data: string): string {
    //yyyymmdd > dd/mm/yyyy
    const ano = data.substring(0, 4);
    const mes = data.substring(4, 6);
    const dia = data.substring(6, 8);

    return `${dia}/${mes}/${ano}`;
  }

  formatDate2(data: string): string {
    //yyyy-mm-ddTHH:Mi:ssZ > dd/mm/yyyy
    const ano = data.substring(0, 4);
    const mes = data.substring(5, 7);
    const dia = data.substring(8, 10);

    return `${dia}/${mes}/${ano}`;
  }

  formatDate3(original: any): string | null {
    // dd/mm/yyyy > yyyy-mm-dd
    const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const correspondencias = regexData.exec(original);
  
    if (!correspondencias) {
      console.error('Formato de data inválido. Use o formato dd/mm/yyyy.');
      return null;
    }
  
    // Extrai os componentes da data
    const dia = correspondencias[1];
    const mes = correspondencias[2];
    const ano = correspondencias[3];
  
    // Constrói a nova string de data no formato yyyy-mm-dd
    const dataFormatoNovo = `${ano}-${mes}-${dia}`;
    return dataFormatoNovo;
  }

  formatDate4(dataString: string): string {
    // dd/mm/yyyy > dd/mm

    const partesData = dataString.split('/');
  
    if (partesData.length === 3) {
      // Cria um objeto Date usando as partes da data
      const data = new Date(+partesData[2], +partesData[1] - 1, +partesData[0]);
  
      // Obtém o dia e o mês formatados
      const dia = ('0' + data.getDate()).slice(-2);
      const mes = ('0' + (data.getMonth() + 1)).slice(-2);
  
      // Retorna a data no formato "dd/mm"
      return `${dia}/${mes}`;
    } else {
      // Trate casos onde a string não está no formato esperado
      console.error('Formato de data inválido');
      return dataString;
    }
  }

  formatDate5(dataISO: string): string {
   
    if(dataISO === undefined){
      return "";
    }

    const data = new Date(dataISO);
    const horas = this.adicionarZero(data.getHours());
    const minutos = this.adicionarZero(data.getMinutes());
    const segundos = this.adicionarZero(data.getSeconds());
    const dia = this.adicionarZero(data.getDate());
    const mes = this.adicionarZero(data.getMonth() + 1);  // Os meses em JavaScript são baseados em zero, então adicione 1
    const ano = data.getFullYear();
    
    return `${horas}:${minutos}:${segundos} ${dia}/${mes}/${ano}`;
  }

  formatDate6(dataString: string): string {
    // yyyy-mm-dd em dd/mm/yyyy
    const partes = dataString.split('-');
    
    // Verificação para garantir que a string foi dividida corretamente
    if (partes.length !== 3) {
      return 'Data inválida';
    }
  
    // Obter os componentes de data (dia, mês, ano)
    const ano = partes[0];
    const mes = partes[1];
    const dia = partes[2];
  
    // Formatar a data como "dd/mm/yyyy"
    return `${dia}/${mes}/${ano}`;
  }
  formatDate7(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // adiciona zero à esquerda se necessário
    const day = date.getDate().toString().padStart(2, '0'); // adiciona zero à esquerda se necessário
    return `${year}-${month}-${day}`;
  }
  
  adicionarZero(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }
  
  formatSize1(tamanhoBytes: number | null): string {
    if (tamanhoBytes !== null) {
      const unidades: string[] = ["Bytes", "KB", "MB", "GB", "TB"];
      let index = 0;
      let tamanho = tamanhoBytes;
  
      while (tamanho >= 1024 && index < unidades.length - 1) {
        tamanho /= 1024;
        index++;
      }
  
      return `${tamanho.toFixed(2)} ${unidades[index]}`;
    } else {
      return " "; // Ou outra lógica de tratamento para valores nulos
    }
  }


  formatSize2(tamanhoBytes: number | null): string {
    if (tamanhoBytes !== null) {
      const unidades: string[] = ["Bytes", "KB", "MB", "GB", "TB"];
      let index = 0;
      let tamanho = tamanhoBytes;
  
      while (tamanho >= 1024 && index < unidades.length - 1) {
        tamanho /= 1024;
        index++;
      }
      return `${tamanho.toFixed(2)}`;
    } else {
      return " "; // Ou outra lógica de tratamento para valores nulos
    }
  }

  removeSufixoformatSize1(tamanho: string): number {
    const valorNumerico = parseFloat(tamanho.replace(/[^\d.]/g, ''));
  
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  formatCNPJ(cnpj: string): string {
    // Remover caracteres não numéricos
    const numerosCNPJ = cnpj.replace(/\D/g, '');

    // Adicionar zeros à esquerda se necessário
    const cnpjCompleto = numerosCNPJ.padStart(14, '0');

    // Formatar o CNPJ
    const parte1 = cnpjCompleto.slice(0, 2);
    const parte2 = cnpjCompleto.slice(2, 5);
    const parte3 = cnpjCompleto.slice(5, 8);
    const parte4 = cnpjCompleto.slice(8, 12);
    const parte5 = cnpjCompleto.slice(12);

    return `${parte1}.${parte2}.${parte3}/${parte4}-${parte5}`;
  }
  calcularDataExpiracao(dias: number): string {
    const dataAtual = new Date();
    const dataExpiracao = new Date(dataAtual.getTime() + dias * 24 * 60 * 60 * 1000);
  
    return this.formatarData(dataExpiracao);
  }
  
  formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = this.adicionarZero(data.getMonth() + 1); // Meses são indexados de 0 a 11
    const dia = this.adicionarZero(data.getDate());
    const horas = this.adicionarZero(data.getHours());
    const minutos = this.adicionarZero(data.getMinutes());
  
    return `${ano}-${mes}-${dia} ${horas}:${minutos}`;
  }
  
  updateTimeRemaining(expiration: string): void {
    let expirationDate: Date = new Date(expiration);
    let timeRemaining: any;
    const currentTime = new Date();
    const difference = expirationDate.getTime() - currentTime.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      timeRemaining = 'Expirado';
    }
    return timeRemaining;
  }
  
  async sendEmail(data: Send): Promise<string> {
    const { dateCurrent, sizeCurrent, sizePrevious, pasta, key, responsavel, email, telefone} = data;
    this.user = this.UserAuth();
    
    const dataAtual = new Date();
    const dataAnterior = new Date(dataAtual);
    dataAnterior.setDate(dataAtual.getDate() - 1);
    const formatoData = { year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const stringDataAtual = dataAtual.toLocaleDateString('pt-BR', formatoData);
    const stringDataAnterior = dataAnterior.toLocaleDateString('pt-BR', formatoData);

    const [dia, mes] = dateCurrent.split('/').map(Number);
    const datasum = new Date(new Date().getFullYear(), mes - 1, dia);
    datasum.setDate(datasum.getDate() + 1);
    const novoDia = datasum.getDate();
    const novoMes = datasum.getMonth() + 1;
    const novaDataString = `${novoDia.toString().padStart(2, '0')}/${novoMes.toString().padStart(2, '0')}`;

    let saudacao;
    const agora = new Date();
    const horas = agora.getHours();
    const minutos = agora.getMinutes();
    const horaAtual = horas * 100 + minutos; // Converter para um número de 4 dígitos (HHMM)
    const formato: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dataHoraEnvio = agora.toLocaleString('pt-BR', formato);
    
    if (horaAtual >= 0 && horaAtual < 1200) {
      saudacao = "Bom dia";
    } else if (horaAtual >= 1200 && horaAtual < 1800) {
      saudacao = "Boa tarde";
    } else {
      saudacao = "Boa noite";
    }

    let situation;
    if(this.formatDate3(dateCurrent) === this.formatDate3(stringDataAtual) || this.formatDate3(dateCurrent) === this.formatDate3(stringDataAnterior)){
      if(parseInt(sizeCurrent) === 0){
        situation = `<b>${this.formatDate4(dateCurrent)}</b> relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} se encontram em nossos servidores com tamanho *zerado*.`;
      } else if( this.removeSufixoformatSize1(sizePrevious) > this.removeSufixoformatSize1(sizeCurrent)){
        situation = `<b>${this.formatDate4(dateCurrent)}</b> relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} se encontram em nossos servidores com tamanho *reduzido*.`; 
      } else {
        situation = `<b>${this.formatDate4(stringDataAtual)}</b> relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} ainda não se encontram em nossos servidores.`;
      }
    } else {
      if(this.formatDate3(dateCurrent) === this.formatDate3(stringDataAtual)){
        situation = `<b>${this.formatDate4(stringDataAtual)}</b> relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} ainda não se encontram em nossos servidores.`;
      } else {
        situation = `<b>${novaDataString}</b> a <b>${this.formatDate4(stringDataAtual)}</b> relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} ainda não se encontram em nossos servidores.`;
      }
    }

    let mensagem = saudacao;
    mensagem += `<br/><br/>`;
    mensagem += `Prezado cliente, gostaria de informar que o backup do(s) dia(s) `;
    mensagem += situation;
    mensagem += `<br/><br/>`;
    mensagem += `Solicitamos que o Responsável TI da loja, entre em contato pelo chat da VRFortaleza para resolvermos esta pendência.`;
    mensagem += `<br/><br/>`;
    mensagem += `Grato desde já, aguardo retorno.`;
    mensagem += `<br/><br/>`;
    mensagem += `Atenciosamente,`;
    mensagem += `<br/>`;
    mensagem += `${this.user.name} - ${this.user.role}.`;
    mensagem += `<br/>`;
    mensagem += `VRFortaleza`;
    
    const emailRemetente = (await this.MonitoringService.getDatatoken()).remetente;
    const emaildestinatariosCopy = (await this.MonitoringService.getDatatoken()).destinatariosCopy;
    const arrayDeEmails: string[] = emaildestinatariosCopy.split(';');
    const ccArray: any[] = [];

    for (const copy of arrayDeEmails) {
        try {
            // Adicione cada destinatário CC ao array cc
            ccArray.push({ email: copy.trim() });
        } catch (error) {
            console.error('Erro ao adicionar destinatário CC:', error);
        }
    }

    const emailData = {
      sender: { name: `SNBackup ${this.formatDate4(dateCurrent)}`, email: emailRemetente },
      to: [{ email: `${email}`, name: `${responsavel.toLowerCase().replace(/\b\w/g, (match: string) => match.toUpperCase())}` }],
      bcc: [{ email: `${emailRemetente}`, name: `SNBackup` }],
      cc: ccArray,
      subject: `${pasta}`,
      htmlContent: `
      <div style=\"width: 69%; left:0%; color:#828282;padding: 0px 0px 20px 50px;font-size: 100%;\">
      <br/>
      <b style='position: absolute; color:#000000; font-size:65%;float: right; '>
      ${dataHoraEnvio}
      </b>
      <br/><br/>
      ${mensagem}
      <br/><br/>
      </div>
      <br/>
      <div style=\"text-align: center;width: 100%; \">
      Essa é uma mensagem automática. Por favor, não responda a esse e-mail.
      <br/>
      © Copyright VRSoftware Unidade de Fortaleza Todos os direitos reservados.
      </div>
      `,
    };
  
    try {
      await (await this.emailService.sendTransactionalEmail(emailData)).toPromise();
      return 'Email enviado com sucesso';
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw { message: 'Erro ao enviar e-mail', error };
    }
  }

  public whatsapp(data: Send):void{
    const { dateCurrent, sizeCurrent, sizePrevious, pasta, key, responsavel, email, telefone} = data;
    this.user = this.UserAuth();

    const Telefone = telefone.replace(/\D/g, ""); 
  
    const dataAtual = new Date();
    const dataAnterior = new Date(dataAtual);
    dataAnterior.setDate(dataAtual.getDate() - 1);
    const formatoData = { year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const stringDataAtual = dataAtual.toLocaleDateString('pt-BR', formatoData);
    const stringDataAnterior = dataAnterior.toLocaleDateString('pt-BR', formatoData);

    let saudacao;
    const agora = new Date();
    const horas = agora.getHours();
    const minutos = agora.getMinutes();
    const horaAtual = horas * 100 + minutos; // Converter para um número de 4 dígitos (HHMM)

    if (horaAtual >= 0 && horaAtual < 1200) {
      saudacao = "Bom dia";
    } else if (horaAtual >= 1200 && horaAtual < 1800) {
      saudacao = "Boa tarde";
    } else {
      saudacao = "Boa noite";
    }

    const [dia, mes] = dateCurrent.split('/').map(Number);
    const datasum = new Date(new Date().getFullYear(), mes - 1, dia);
    datasum.setDate(datasum.getDate() + 1);
    const novoDia = datasum.getDate();
    const novoMes = datasum.getMonth() + 1;
    const novaDataString = `${novoDia.toString().padStart(2, '0')}/${novoMes.toString().padStart(2, '0')}`;


    let situacao;
    if(this.formatDate3(dateCurrent) === this.formatDate3(stringDataAtual) || this.formatDate3(dateCurrent) === this.formatDate3(stringDataAnterior)){
      if(parseInt(sizeCurrent) === 0){
        situacao = `*${this.formatDate4(dateCurrent)}* relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} se encontram em nossos servidores com tamanho *zerado*.`;
      } else if( this.removeSufixoformatSize1(sizePrevious) > this.removeSufixoformatSize1(sizeCurrent)){
        situacao = `*${this.formatDate4(dateCurrent)}* relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} se encontram em nossos servidores com tamanho *reduzido*.`; 
      } else {
        situacao = `*${this.formatDate4(stringDataAtual)}* relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} ainda não se encontram em nossos servidores.`;
      }
    } else {
      if(this.formatDate3(dateCurrent) === this.formatDate3(stringDataAtual)){
        situacao = `*${this.formatDate4(stringDataAtual)}* relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} ainda não se encontram em nossos servidores.`;
      } else {
        situacao = `*${this.formatDate4(novaDataString)}* a *${this.formatDate4(stringDataAtual)}* relativos à loja ${pasta} - CNPJ: ${this.formatCNPJ(key)} ainda não se encontram em nossos servidores.`;
      }
    }
    
    let mensagem: string = `${saudacao}, ${responsavel.toLowerCase().replace(/\b\w/g, (match: string) => match.toUpperCase())},\nEspero que esta mensagem o encontre bem.\n\n`;
    mensagem += "Identificamos que os backups do(s) dia(s) ";
    mensagem += situacao + "\n";
    mensagem += "Solicitamos o acesso à máquina onde a aplicação está instalada para resolvermos esta pendência.\n\n";
    mensagem += "Agradecemos pela colaboração.\n\n";
    mensagem += `Atenciosamente,\n${this.user.name} - ${this.user.role}.\nVRFortaleza`;

    const textoCodificado: string = encodeURIComponent(mensagem);

    const linkWhatsApp = "https://api.whatsapp.com/send/?phone=55"+Telefone+"&text="+textoCodificado;
    
    try {

      window.open(linkWhatsApp, '_blank');
    } catch (error) {
      console.error('Erro ao tentar abrir o link:', error);
    }
  
  }
 
}
