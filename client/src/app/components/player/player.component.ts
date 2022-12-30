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
  seeking: boolean = false;
  seekbar: FormControl = new FormControl("seekbar");
  currentIndex: number;
  playlist: AudioMedia[] = new Array<AudioMedia>();
  playerState: PlayerState;

  constructor(
    public route: ActivatedRoute,
    public player: PlayerService,
    public metadata: MetadataService) {
    player.getState().subscribe(state => this.playerState = state);
    player.getEvents().subscribe(e => {
      if (e.type == "ended") this.next();
    })
  }

  ngOnInit() {

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
    // TODO: Emit an error dialog
    try {
      console.log("Playing previous");
      let restart = this.playerState.currentTime > 2;

      this.player.pause();
      this.player.seek(0);

      if (restart) {  
        this.player.play();
        return;
      }

      var currentId = this.player.getCurrentlyPlaying().getValue();
      var prev = this.metadata.getPrevMediaById(currentId);
      this.player.load(prev.audioTargetId, prev.name, prev.index)
        .catch(() => console.log("Couldn't load previous media"));
    } catch (e) {
      console.log("Could not play previous - ", e);
    }
  }

  next() {
    // TODO: Emit an error dialog
    try {
      var currentId = this.player.getCurrentlyPlaying().getValue();
      var nxt = this.metadata.getNextMediaById(currentId);
      this.player.load(nxt.audioTargetId, nxt.name, nxt.index)
        .then(() => this.play())
        .catch(() => console.log("Couldn't load next media"));
    } catch(e) {
      console.log("Could not play next - ", e);
    }
  }

  startSeek() {
    this.pause();
    this.seeking = true;
  }

  endSeek() {
    if (this.seeking) {
      this.play();
      this.seeking = false;
    }
  }

  setSeek(event) {
    if (this.seeking) {
      this.player.seek(parseFloat(event.target.value));
    }
  }

  nowPlaying() {
    return this.currentIndex;
  }
}

