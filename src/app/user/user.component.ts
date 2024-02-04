import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  email = '' as any;
  password = '' as any;
  passwordNew = '' as any;
  passwordNewConfirm = '' as any;
  name = '' as any;
  role = '' as any;
  key: any;
  action: any;
  user: any;
  constructor(public auth: AuthService, private route: ActivatedRoute){}

  async ngOnInit(): Promise<void> {

    this.user = this.auth.UserAuth();

    if(this.user){
      this.route.params.subscribe(params => {
        this.key = params['key'];
        this.action = params['Action'] === 'Perfil' ? 0:params['Action'] === undefined ? 2 : 1;
      });
      
      try {
        const user = this.auth.UserAuth();
        this.name = this.action === 2 ? '': user.name;
        this.role = this.action === 2 ? '': user.role;
        this.email= this.action === 2 ? '': user.email;
    
      } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
      }
    } else {
      this.auth.navigate("");
    }
  }
  
  signOut():void {
    this.auth.navigate("Monitoring");
  }

  async changePasswordNew(): Promise<void> {
    try {
      this.auth.navigate(`User/Password/${this.user.uid}`);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
    }
  }
}


