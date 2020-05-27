import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStatisticsComponent } from './test-statistics.component';

describe('TestStatisticsComponent', () => {
  let component: TestStatisticsComponent;
  let fixture: ComponentFixture<TestStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
