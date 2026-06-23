import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { UpdaterService } from 'src/app/services/Updater/updater.service';

import { UpdatePage } from './update.page';

describe('UpdatePage', () => {
  let component: UpdatePage;
  let fixture: ComponentFixture<UpdatePage>;
  const updaterSpy = jasmine.createSpyObj('UpdaterService', ['GetUpdater', 'UpdateWithStatus']);

  beforeEach(waitForAsync(() => {
    updaterSpy.UpdateWithStatus.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [UpdatePage],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: UpdaterService, useValue: updaterSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
