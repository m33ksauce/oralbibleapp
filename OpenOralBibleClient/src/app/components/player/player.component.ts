import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AudioMedia } from 'src/app/models/AudioMedia';
import { PlayerState } from 'src/app/interfaces/player-state';
import { PlayerService } from 'src/app/services/Player/player.service';
import { MetadataService } from 'src/app/services/Metadata/metadata.service';

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
  currentIndex: number;
  playlist: AudioMedia[] = new Array<AudioMedia>();
  playerState: PlayerState;

  constructor(
    public route: ActivatedRoute,
    public player: PlayerService,
    public metadata: MetadataService) {
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
    var prev = this.metadata.getPrevMedia(this.playerState.index);
    var audio = this.metadata.getAudioFileFromTarget(prev.audioTargetId);
    this.player.loadMedia(audio, prev.name, prev.index);
    this.play();
  }

  next() {
    console.log("playing next");
    var nxt = this.metadata.getNextMedia(this.playerState.index);
    var audio = this.metadata.getAudioFileFromTarget(nxt.audioTargetId);
    this.player.loadMedia(audio, nxt.name, nxt.index);
    this.play();
  }

  startSeek() {
    this.pause();
  }

  endSeek(event) {
    this.player.seek(event.value);
    this.play();
  }
}

