import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataBaseAddComponent } from './data-base-add.component';

describe('DataBaseAddComponent', () => {
  let component: DataBaseAddComponent;
  let fixture: ComponentFixture<DataBaseAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataBaseAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataBaseAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
