import { Injectable, SecurityContext } from '@angular/core';
import { PlayerState, MakeDefaultState } from 'src/app/interfaces/player-state';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService } from '../Storage/storage.service';
import { initialize } from '@ionic/core';
import { take, takeLast } from 'rxjs/operators';

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

  private initialized = false;
  private state: PlayerState = MakeDefaultState();

  private stateSubject: BehaviorSubject<PlayerState> =
    new BehaviorSubject<PlayerState>(this.state);
  private eventSubject = new Subject<Event>();
  private currentlyPlayingSubject: BehaviorSubject<string> = 
    new BehaviorSubject<string>("");

  constructor(private storage: StorageService, private sanitizer: DomSanitizer) { }

  getState(): Observable<PlayerState> {
    return this.stateSubject.asObservable();
  }

  getCurrentlyPlaying(): BehaviorSubject<string> {
    return this.currentlyPlayingSubject;
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


  initializePlayer() {
    const handler = (event: Event) => {
      this.updateState(event);
    }

    this.addEvents(this.player, this.playerEvents, handler);
    this.addEvents(this.player, ["ended"], (e) => {
      this.eventSubject.next(e);
    });

    this.initialized = true;
  }

  async load(media, title, index) {

    return new Promise<void>((resolve, reject) => {
      this.storage.getKey<any>(`media-${media}`).pipe(take(1)).subscribe(
        (d) => {
          try {
            var blob = new Blob([d["buffer"]], { type: "audio/mpeg" });
            var dURL = URL.createObjectURL(blob);
            this.player.src = dURL;
            console.log(`Loading media ${this.player.src}`);
            this.player.load();
            console.log('Loaded media');
            this.clearState();
            this.state.mediaTitle = title;
            this.state.index = index;

            if (this.initialized == false) this.initializePlayer();
            
            this.currentlyPlayingSubject.next(media)
            console.log("Finished loading")
            resolve();
          } catch (e) {
            console.log(`Failed loading media: ${e}`)
            reject();
          }
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
    try {
      return this.player.play();
    } catch (e) {
      console.log(`Couldn't play: ${e}`)
    }
  }

  pause() {
    try {
      return this.player.pause();
    } catch (e) {
      console.log(`Couldn't pause: ${e}`)
    }
  }

  seek(time) {
    try {
      this.player.currentTime = time;
    } catch (e) {
      console.log(`Couldn't seek: ${e}`)
    }

  }

  formatTime(time: number) {
    return moment.utc(time * 1000).format("mm:ss");
  }
}
