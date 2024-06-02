import { TestBed } from '@angular/core/testing';

import { InsertitemService } from './insertitem.service';

describe('InsertitemService', () => {
  let service: InsertitemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsertitemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
