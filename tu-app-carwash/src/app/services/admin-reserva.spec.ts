import { TestBed } from '@angular/core/testing';

import { AdminReservaService } from './admin-reserva';
import { ApiService } from './api.service';

describe('AdminReservaService', () => {
  let service: AdminReservaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: {
            get: () => ({ subscribe: () => undefined }),
            put: () => ({ subscribe: () => undefined }),
          }
        }
      ]
    });
    service = TestBed.inject(AdminReservaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
