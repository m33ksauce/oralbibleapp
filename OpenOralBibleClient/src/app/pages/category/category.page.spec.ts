import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPage } from './category.page';
import { Router, ActivatedRoute } from '@angular/router';

describe('CategoryPage', () => {
  let component: CategoryPage;
  let fixture: ComponentFixture<CategoryPage>;
  let mockRouter = {
    navigae: jasmine.createSpy('navigate')
  };
  let mockActivatedRoute = {
    params: {
      subscribe: jasmine.createSpy('subscribe')
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: ActivatedRoute, useValue: mockActivatedRoute}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
