import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Register } from '../register/register.component';
import { Token } from '../monitoring/monitoring.component';
@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  constructor(private db: AngularFireDatabase) { }

  getDataLincese(): Observable<any[]> {
    const licenseRef: AngularFireList<any> = this.db.list('/license');
    return licenseRef.snapshotChanges().pipe(
      map(changes => {
        return changes.map(c => {
          const key: string = c.payload.key as string;
          const data: any = c.payload.val();
          return { key, ...data };
        });
      })
    );
  }
  getDataInformation(): Observable<any[]> {
    return this.db.list('/information').valueChanges();
  }

  async getDataRegister(key: string): Promise<Register> {
    return (await this.db.database.ref(`/license/${key}`)
      .orderByKey()
      .once('value')
    ).val();
  }

  async getDatatoken(): Promise<Token> {
    return (await this.db.database.ref(`/authorizationDropbox`)
      .orderByKey()
      .once('value')
    ).val();
  }
  
  updateRegister(key: string, data: Register): Promise<void> {
    
    const { razaoSocial, status, email, responsavel, telefone, acesso, senha, qtdLoja, estado, so, observacao, config, expirationDate } = data;
    return this.db.database.ref(`/license/${key}`).set({
      razaoSocial,
      status,
      email,
      responsavel,
      telefone,
      acesso,
      senha,
      qtdLoja,
      estado,
      so,
      observacao,
      config,
      expirationDate
    });

    
  }

  updateToken(data: Token): Promise<void> {
    
    const { clientId, clientSecret, refreshToken, tokenEndpoint } = data;
    return this.db.database.ref(`/authorizationDropbox`).set({
      clientId,
      clientSecret, 
      refreshToken, 
      tokenEndpoint
    });
  }

}
