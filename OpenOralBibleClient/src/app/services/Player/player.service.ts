import { Injectable } from '@angular/core';
import { PlayerState, MakeDefaultState } from 'src/app/interfaces/player-state';
import { BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private player = new Audio();

  playerEvents = [
    "play",
    "playing",
    "pause",
    "timeupdate"
  ]

  private state: PlayerState = MakeDefaultState();

  private stateSubject: BehaviorSubject<PlayerState> = 
    new BehaviorSubject<PlayerState>(this.state);

  constructor() { }

  getState(): Observable<PlayerState> {
    return this.stateSubject.asObservable();
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
    this.player.src = media;
    this.player.load();
    this.clearState();
    this.state.mediaTitle = title;
    this.state.index = index;

    const handler = (event: Event) => {
      this.updateState(event);
    }

    this.addEvents(this.player, this.playerEvents, handler);
  }

  addEvents(player: HTMLAudioElement, playerEvents: string[], handler: (event: Event) => void) {
    playerEvents.forEach(event => {
      player.addEventListener(event, handler);
    })
  }

  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  seek(time) {
    console.log("we in here")
    this.player.currentTime = time;
  }

  formatTime(time: number) {
    return moment.utc(time * 1000).format("mm:ss");
  }
}
