import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MediaItemComponent } from './media-item.component';
import { storageServiceSpy } from 'src/test/storageSpy';
import { StorageService } from 'src/app/services/Storage/storage.service';
import { MakeDefaultState } from 'src/app/interfaces/player-state';
import { PlayerService } from 'src/app/services/Player/player.service';
import { Observable } from 'rxjs';
import { MetadataService } from 'src/app/services/Metadata/metadata.service';

describe('MediaItemComponent', () => {
  let component: MediaItemComponent;
  let fixture: ComponentFixture<MediaItemComponent>;
  let playerServiceSpy = jasmine.createSpyObj('PlayerService', ['getState']);
  let metadataServiceSpy = jasmine.createSpyObj('MetadataService', ['getAudioFileFromTarger']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaItemComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MetadataService, useValue: metadataServiceSpy },
        { provide: PlayerService, useValue: playerServiceSpy},
      ],
    }).compileComponents();
  }));

  xit('should create', () => {
    // Arrange
    playerServiceSpy.getState.and.callFake(() => new Observable(sub => {
      sub.next(MakeDefaultState());
    }))

    // Act
    fixture = TestBed.createComponent(MediaItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert
    expect(component).toBeTruthy();
  });
});
