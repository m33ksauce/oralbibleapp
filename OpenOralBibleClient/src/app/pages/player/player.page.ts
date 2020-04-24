import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AudioMedia } from 'src/app/models/AudioMedia';
import { AudioMediaService } from 'src/app/services/AudioMedia/AudioMedia.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
  media: AudioMedia;
  playlist: AudioMedia[] = new Array<AudioMedia>();

  constructor(public audioService: AudioMediaService, public route: ActivatedRoute) {  }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.setMedia(params.id)
    )
  }

  setMedia(id?: String) {
    if (id != undefined) {
      this.playlist.push(this.audioService.getMedia(id));
      if (this.media == undefined) {
        this.media = this.playlist.shift();
      }
    }
  }

}
