import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { addIcons } from 'ionicons';
import {
  carSportOutline,
  waterOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  carOutline,
  car,  // Agregado para el menú
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  checkmarkCircleOutline,
  locationOutline,
  cashOutline,
  arrowForwardOutline,
  arrowBackOutline,
  logOutOutline,
  settingsOutline,
  chevronForwardOutline,
  closeCircleOutline,
  // Agregando iconos faltantes
  person,
  water,
  calendar,
  addCircle,
  addCircleOutline,
  home,
  homeOutline,
  bicycleOutline
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// ⚡ FUNCIÓN DE INICIALIZACIÓN PARA REGISTRAR ICONOS
export function initializeIcons() {
  return () => {
    addIcons({
      'car-sport-outline': carSportOutline,
      'water-outline': waterOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'person-outline': personOutline,
      'car-outline': carOutline,
      'car': car,  // Agregado para el menú
      'add-outline': addOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'close-outline': closeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'location-outline': locationOutline,
      'cash-outline': cashOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'arrow-back-outline': arrowBackOutline,
      'log-out-outline': logOutOutline,
      'settings-outline': settingsOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'close-circle-outline': closeCircleOutline,
      // Agregando iconos faltantes
      'person': person,
      'water': water,
      'calendar': calendar,
      'add-circle': addCircle,
      'add-circle-outline': addCircleOutline,
      'home': home,
      'home-outline': homeOutline,
      'bicycle-outline': bicycleOutline
    });
    return Promise.resolve();
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios', animated: false }),
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(),
    provideNoopAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      multi: true
    }
  ],
});
