import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  email = '' as any;
  password = '' as any;

  dadosDoFirebase: any[] = [];

  constructor(public auth: AuthService){}
}
