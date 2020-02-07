import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiblePage } from './bible.page';

describe('BiblePage', () => {
  let component: BiblePage;
  let fixture: ComponentFixture<BiblePage>;
  let mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };
  let mockActivatedRoute = {
    params: {
      subscribe: jasmine.createSpy('subscribe')
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BiblePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: ActivatedRoute, useValue: mockActivatedRoute}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiblePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
