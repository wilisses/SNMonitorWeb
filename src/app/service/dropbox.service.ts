import { Injectable } from '@angular/core';
import * as Dropbox from 'dropbox';

@Injectable({
  providedIn: 'root'
})
export class DropboxService {

  private dbx: Dropbox.Dropbox;

  constructor() {
    this.dbx = new Dropbox.Dropbox({
      accessToken: 'TXFh0FdbcMAAAAAAAAAB7O1RABFC9-6BPAlExg6gj14MHJghyPAvUkVcu-4bo67D',
    });
  }

  async listarArquivos(caminho: string): Promise<Dropbox.files.ListFolderResult> {
    try {
      const response = await this.dbx.filesListFolder({ path: caminho });
      return response.result;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }
}
