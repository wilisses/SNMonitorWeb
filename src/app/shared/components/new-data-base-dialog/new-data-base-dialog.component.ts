import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-data-base-dialog',
  templateUrl: './new-data-base-dialog.component.html',
  styleUrl: './new-data-base-dialog.component.css'
})
export class NewDataBaseDialogComponent implements OnInit {
  databasename: string = '';
  caminhodapasta: string = '';
  firstSchedule: string = '';
  secondSchedule: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewDataBaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: any,
  ) {}

  ngOnInit(): void {
    this.databasename = this.data.databasename;
    this.caminhodapasta = this.data.caminhopasta;
    this.firstSchedule = this.data.firstSchedule;
    this.secondSchedule = this.data.secondSchedule;
  }

  change():void{

  }

  async submit(): Promise<void> {

    // Função para formatar a hora
    function formatHour(hour: string): string {
      if (hour.length === 4) {
        return `${hour.slice(0, 2)}:${hour.slice(2)}`;
      } else {
        return '  :  ';
      }
    }

    if(this.firstSchedule.length === 4) {
      this.firstSchedule = formatHour(this.firstSchedule);
    }

    if(this.secondSchedule.length === 4) {
      this.secondSchedule = formatHour(this.secondSchedule);
    }
    
    const dados = {
      databasename: this.databasename,
      caminhopasta: this.caminhodapasta,
      firstSchedule: this.firstSchedule,
      secondSchedule: this.secondSchedule
    };
    
    this.dialogRef.close(dados);
  
  }
}
