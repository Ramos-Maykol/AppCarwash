import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private router = inject(Router);

  constructor() {
    // Los iconos ya están registrados en main.ts antes del bootstrap
    // Evitar que el elemento con foco quede dentro de una página marcada como aria-hidden durante la transición
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart) {
        const active = document.activeElement as HTMLElement | null;
        if (active && typeof active.blur === 'function') {
          // Pequeño defer para no interferir con ion-router-link
          setTimeout(() => active.blur(), 0);
        }
      }
    });

    // Observar páginas ocultas y aplicar 'inert' automáticamente
    this.setupInertForHiddenPages();
  }

  private setupInertForHiddenPages() {
    const applyInert = (el: HTMLElement) => {
      if (el.getAttribute('aria-hidden') === 'true') {
        el.setAttribute('inert', '');
        // Si el foco está dentro de esta página oculta, quitarlo
        const active = document.activeElement as HTMLElement | null;
        if (active && el.contains(active) && typeof active.blur === 'function') {
          active.blur();
        }
      } else {
        el.removeAttribute('inert');
      }
    };

    // Inicial: marcar las que ya estén ocultas
    document.querySelectorAll<HTMLElement>('.ion-page[aria-hidden="true"]').forEach(applyInert);

    // Observar cambios de aria-hidden en todo el documento (solo este atributo)
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'aria-hidden') {
          const el = m.target as HTMLElement;
          if (el.classList.contains('ion-page')) {
            applyInert(el);
          }
        }
      }
    });

    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['aria-hidden'] });
  }
}
