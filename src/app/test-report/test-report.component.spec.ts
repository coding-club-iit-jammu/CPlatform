import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestReportComponent } from './test-report.component';

describe('TestReportComponent', () => {
  let component: TestReportComponent;
  let fixture: ComponentFixture<TestReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
