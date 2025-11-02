import { Component } from '@angular/core';

@Component({
  selector: 'app-login-page',
  template: `
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Inicio de sesión</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Inicio de sesión</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-input type="text" placeholder="Usuario" [(ngModel)]="username"></ion-input>
            <ion-input type="password" placeholder="Contraseña" [(ngModel)]="password"></ion-input>
            <ion-button (click)="login()">Iniciar sesión</ion-button>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  `,
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = '';
  password: string = '';

  constructor() {}

  login(): void {
    // Lógica de inicio de sesión
  }

  // Añadido/asegurado para que (ionViewDidEnter)="onPageEnter()" no falle en la plantilla
  onPageEnter(): void {
    // lógica al entrar en la página (vacío por defecto)
  }
}