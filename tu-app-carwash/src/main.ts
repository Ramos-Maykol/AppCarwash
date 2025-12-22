import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { addIcons } from 'ionicons';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// 1. AGREGAMOS LOS ÍCONOS FALTANTES AQUI (statsChart, calendarNumber, people)
import {
  carSportOutline, waterOutline, calendarOutline, timeOutline, personOutline,
  carOutline, car, addOutline, createOutline, trashOutline, closeOutline,
  checkmarkCircleOutline, locationOutline, cashOutline, arrowForwardOutline,
  arrowBackOutline, logOutOutline, settingsOutline, chevronForwardOutline,
  closeCircleOutline, person, water, calendar, addCircle, addCircleOutline,
  home, homeOutline, bicycleOutline,
  // --- NUEVOS ---
  statsChart,
  calendarNumber,
  people,
  peopleOutline, // Agrego este por si acaso usas la versión outline
  statsChartOutline, // Agrego este por si acaso
  calendarNumberOutline // Agrego este por si acaso
  // --------------
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/interceptors/auth.interceptor';

export function initializeIcons() {
  return () => {
    addIcons({
      'car-sport-outline': carSportOutline,
      'water-outline': waterOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'person-outline': personOutline,
      'car-outline': carOutline,
      'car': car,
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
      'person': person,
      'water': water,
      'calendar': calendar,
      'add-circle': addCircle,
      'add-circle-outline': addCircleOutline,
      'home': home,
      'home-outline': homeOutline,
      'bicycle-outline': bicycleOutline,

      // 2. REGISTRAMOS LOS NUEVOS AQUÍ
      'stats-chart': statsChart,
      'stats-chart-outline': statsChartOutline,
      'calendar-number': calendarNumber,
      'calendar-number-outline': calendarNumberOutline,
      'people': people,
      'people-outline': peopleOutline
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
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideNoopAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      multi: true
    },
    provideCharts(withDefaultRegisterables())
  ],
});