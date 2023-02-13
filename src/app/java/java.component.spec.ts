import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { JavaComponent } from './java.component';

describe('JavaComponent', () => {
    let component: JavaComponent;
    let fixture: ComponentFixture<JavaComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [JavaComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JavaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});