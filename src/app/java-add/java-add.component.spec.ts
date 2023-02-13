import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { JavaAddComponent } from './java-add.component';

describe('JavaAddComponent', () => {
  let component: JavaAddComponent;
  let fixture: ComponentFixture<JavaAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
