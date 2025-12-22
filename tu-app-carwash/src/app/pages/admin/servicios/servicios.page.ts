import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-servicios-admin',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonMenuButton],
})
export class ServiciosPage {}
