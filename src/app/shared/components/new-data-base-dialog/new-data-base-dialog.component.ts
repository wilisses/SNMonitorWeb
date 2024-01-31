import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-data-base-dialog',
  templateUrl: './new-data-base-dialog.component.html',
  styleUrl: './new-data-base-dialog.component.css'
})
export class NewDataBaseDialogComponent {
  databasename: string = '';
  caminhodapasta: string = '';
  firstSchedule: string = '';
  secondSchedule: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewDataBaseDialogComponent>
  ) {}

  change():void{

  }

  async submit(): Promise<void> {
    
    const dados = {
      databasename: this.databasename,
      caminhopasta: this.caminhodapasta,
      firstSchedule: this.firstSchedule,
      secondSchedule: this.secondSchedule
    };
    
    this.dialogRef.close(dados);
  
  }
}
