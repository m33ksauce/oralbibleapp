import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AudioMedia } from 'src/app/models/AudioMedia';
import { AudioMediaService } from 'src/app/services/AudioMedia/AudioMedia.service';
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
    public audioService: AudioMediaService,
    public route: ActivatedRoute,
    public player: PlayerService,
    public categoryService: CategoryMediaService) {
      player.getState().subscribe(state => this.playerState = state);
    }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.setMedia(params.id)
    )
  }

  setMedia(id?: string) {
    if (id != undefined) {
      this.media = this.audioService.getMedia(id);
      if (this.media != undefined) {
        this.player.loadMedia(this.media.target)
        this.play();
      }
    }
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
    var prevMedia = this.categoryService.getPrevious(this.media.id);
    this.setMedia(prevMedia.id);
  }

  next() {
    console.log("playing next");
    var nextMedia = this.categoryService.getNext(this.media.id);
    this.setMedia(nextMedia.id);
  }

  startSeek() {
    this.pause();
  }

  endSeek(event) {
    this.player.seek(event.value);
    this.play();
  }
}

