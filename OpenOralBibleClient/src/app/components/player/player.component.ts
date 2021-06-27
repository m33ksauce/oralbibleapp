import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AudioMedia } from 'src/app/models/AudioMedia';
import { PlayerState } from 'src/app/interfaces/player-state';
import { PlayerService } from 'src/app/services/Player/player.service';
import { CategoryMediaService } from 'src/app/services/CategoryMedia/CategoryMedia.service';

const states = {
  DEFAULT: 'default',
  PLAYING: 'playing',
  PAUSED: 'paused'
}
@Component({
  selector: 'bible-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})

export class PlayerComponent implements OnInit {
  seekbar: FormControl = new FormControl("seekbar");
  media: AudioMedia;
  playlist: AudioMedia[] = new Array<AudioMedia>();
  playerState: PlayerState;

  constructor(
    public route: ActivatedRoute,
    public player: PlayerService,
    public categoryService: CategoryMediaService) {
      player.getState().subscribe(state => this.playerState = state);
    }

  ngOnInit() {

  }

  setMedia(id?: string) {
    
  }

  play() {
    this.playerState.playing = true;
    this.player.play();
  }

  pause() {
    this.playerState.playing = false;
    this.player.pause();
  }

  previous() {
    console.log("playing previous");
  }

  next() {
    console.log("playing next");
  }

  startSeek() {
    this.pause();
  }

  endSeek(event) {
    this.player.seek(event.value);
    this.play();
  }
}

