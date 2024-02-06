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
  edit: boolean = false;
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
    this.edit = true;
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

    if(this.firstSchedule.length === 4 || this.firstSchedule.length === 0) {
      this.firstSchedule = formatHour(this.firstSchedule);
    }

    if(this.secondSchedule.length === 4 || this.secondSchedule.length === 0) {
      this.secondSchedule = formatHour(this.secondSchedule);
    }
    
    const dados = {
      databasename: this.databasename,
      caminhopasta: this.caminhodapasta,
      firstSchedule: this.firstSchedule,
      secondSchedule: this.secondSchedule
    };

    const res = {
      dados: dados,
      edit: this.edit
    }
    
    this.dialogRef.close(res);
  
  }
}
