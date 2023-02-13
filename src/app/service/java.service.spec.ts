import { TestBed, inject } from '@angular/core/testing';

import { JavaService } from './java.service';

describe('JavaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JavaService]
    });
  });

  it('should be created', inject([JavaService], (service: JavaService) => {
    expect(service).toBeTruthy();
  }));
});