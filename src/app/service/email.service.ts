// email.service.ts

import { Injectable } from '@angular/core';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';


@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor() { }

  // enviarEmail(): void {
  //   console.log('aqui52')

  //   const templateParams = {
  //     name: 'James',
  //     notes: 'Check this out!',
  //     to_email: 'suporte@vrfortaleza.com.br'
  //   };

  //   const userID = 'jVu0eTTNQUxryvJ3T'; // Substitua pelo seu ID do usuário do Email.js
  //   const serviceID = 'service_8s62izl';
  //   const templateID = 'template_wbgrqi3';

  //   emailjs.send(serviceID, templateID, templateParams, userID).then(
  //     (response) => {
  //       console.log('SUCCESS!', response.status, response.text);
  //     },
  //     (error) => {
  //       console.log('FAILED...', error);
  //     }
  //   );
  // }

  public sendEmail(e: Event) {
    e.preventDefault();

    emailjs
      .sendForm('service_8s62izl', 'template_wbgrqi3', e.target as HTMLFormElement, {
        publicKey: 'jVu0eTTNQUxryvJ3T',
      })
      .then(
        () => {
          console.log('SUCCESS!');
        },
        (error) => {
          console.log('FAILED...', (error as EmailJSResponseStatus).text);
        },
      );
  }

}
