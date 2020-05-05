import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AudioMedia } from 'src/app/models/AudioMedia';
import { AudioMediaService } from 'src/app/services/AudioMedia/AudioMedia.service';

const states = {
  DEFAULT: 'default',
  PLAYING: 'playing',
  PAUSED: 'paused'
}

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})

export class PlayerPage implements OnInit {
  media: AudioMedia;
  playlist: AudioMedia[] = new Array<AudioMedia>();
  player = new Audio();
  playerState: string = states.DEFAULT;

  constructor(public audioService: AudioMediaService, public route: ActivatedRoute) {
    this.player.onplay = () => { this.playerState = states.PLAYING };
    this.player.onpause = () => { this.playerState = states.PAUSED };
    this.player.onended = () => { this.playerState = states.DEFAULT };
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.setMedia(params.id)
    )
  }

  setMedia(id?: string) {
    if (id != undefined) {
      this.playlist.push(this.audioService.getMedia(id));
      if (this.media == undefined) {
        this.media = this.playlist.shift();
      }
    }
    this.player.src = this.media.target;
    this.playMedia();
  }

  playMedia() {
    console.log("should be playing");
    this.player.play();
  }


  pauseMedia() {
    console.log("set pause")
    this.player.pause();
  }

  togglePlay() {
    if (this.playerState == states.DEFAULT) {
      this.playMedia();
    }
    if (this.playerState == states.PAUSED) {
      this.playMedia();
    }
    if (this.playerState == states.PLAYING) {
      this.pauseMedia();
    }
  }
}
