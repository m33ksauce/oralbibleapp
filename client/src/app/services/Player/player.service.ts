import { Injectable, SecurityContext } from '@angular/core';
import { PlayerState, MakeDefaultState } from 'src/app/interfaces/player-state';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService } from '../Storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private player = new Audio();

  playerEvents = [
    "play",
    "playing",
    "pause",
    "timeupdate",
  ]

  private state: PlayerState = MakeDefaultState();

  private stateSubject: BehaviorSubject<PlayerState> = 
    new BehaviorSubject<PlayerState>(this.state);
  private eventSubject = new Subject<Event>();

  constructor(private storage: StorageService, private sanitizer: DomSanitizer) { }

  getState(): Observable<PlayerState> {
    return this.stateSubject.asObservable();
  }

  getEvents(): Observable<Event> {
    return this.eventSubject.asObservable();
  }

  private clearState() {
    this.state = MakeDefaultState();
  }

  updateState(event: Event) {
    switch (event.type) {
      case "playing":
        this.state.playing = true;
        this.state.currentTime = this.player.currentTime;
        this.state.duration = this.player.duration;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime)
        this.state.readableDuration = this.formatTime(this.state.duration);
        break;
      case "timeupdate":
        this.state.currentTime = this.player.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.player.currentTime);
        break;
    }
    this.stateSubject.next(this.state);
  }

  loadMedia(media, title, index) {
    return new Promise<void>((resolve, reject) => {
      this.storage.getKey<any>(`media-${media}`).subscribe(
        (d) => {
          // TODO: Handle missing media
          // TODO: Handle exceptions
          var blob = new Blob([d["buffer"]], {type: "audio/mpeg"});
          var dURL = URL.createObjectURL(blob);
          this.player.src = dURL;
          console.log(`Loading media ${this.player.src}`);
          this.player.load();
          console.log('Loaded media');
          this.clearState();
          this.state.mediaTitle = title;
          this.state.index = index;
    
          const handler = (event: Event) => {
            this.updateState(event);
          }
    
          this.addEvents(this.player, this.playerEvents, handler);
          this.addEvents(this.player, ["ended"], (e) => {
            this.eventSubject.next(e);
          });
          console.log("Finished loading")
          resolve();
        },
        (err) => reject(err));
    }) 
  }

  addEvents(player: HTMLAudioElement, playerEvents: string[], handler: (event: Event) => void) {
    playerEvents.forEach(event => {
      player.addEventListener(event, handler);
    })
  }

  play() {
    // TODO: add try/catch
    this.player.play();
  }

  pause() {
    // TODO: add try/catch
    this.player.pause();
  }

  seek(time) {
    // TODO: add try/catch
    this.player.currentTime = time;
  }

  formatTime(time: number) {
    return moment.utc(time * 1000).format("mm:ss");
  }
}
