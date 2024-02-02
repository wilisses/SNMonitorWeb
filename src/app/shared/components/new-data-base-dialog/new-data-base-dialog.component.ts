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

    // Função para formatar a hora
    function formatHour(hour: string): string {
      if (hour.length === 4) {
        return `${hour.slice(0, 2)}:${hour.slice(2)}`;
      } else {
        return 'Formato de hora inválido';
      }
    }

    const formattedFirstSchedule = formatHour(this.firstSchedule);
    const formattedSecondSchedule = formatHour(this.secondSchedule);

    const dados = {
      databasename: this.databasename,
      caminhopasta: this.caminhodapasta,
      firstSchedule: formattedFirstSchedule,
      secondSchedule: formattedSecondSchedule
    };
    
    this.dialogRef.close(dados);
  
  }
}
