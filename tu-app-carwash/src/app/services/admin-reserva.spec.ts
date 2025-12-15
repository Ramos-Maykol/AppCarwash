import { TestBed } from '@angular/core/testing';

import { AdminReserva } from './admin-reserva';

describe('AdminReserva', () => {
  let service: AdminReserva;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminReserva);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
