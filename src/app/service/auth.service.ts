import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: any;
  error: any;
  userAuth: any;
  constructor(public auth: AngularFireAuth,private router: Router,private _snackBar: MatSnackBar) { }

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

  formatDate3(original: string): string | null {
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
  

}
