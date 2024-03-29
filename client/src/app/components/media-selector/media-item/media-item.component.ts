import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonCard } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MediaListItem } from 'src/app/models/MediaListItem';
import { MetadataService } from 'src/app/services/Metadata/metadata.service';
import { PlayerService } from 'src/app/services/Player/player.service';

@Component({
  selector: 'media-item',
  templateUrl: './media-item.component.html',
  styleUrls: ['./media-item.component.scss'],
})
export class MediaItemComponent implements OnInit, AfterViewInit {
  @Input() item: MediaListItem;
  @Input() visible: boolean = true;
  @Input() index: number;
  @ViewChild('card', { read: ElementRef }) cardLabel: ElementRef
  private playing: boolean = false;
  private currentlyPlayingSub: Subscription;

  constructor(
    private renderer: Renderer2,
    private playerService: PlayerService
    ) { }

  ngOnInit() {  }

  ngAfterViewInit() {
    this.setVisibility(false);
    this.currentlyPlayingSub = this.playerService.getCurrentlyPlaying().subscribe(media => {
      this.setPlaying(media == this.item.audioTargetId);
    });
  }

  ngOnDestroy() {
    this.currentlyPlayingSub.unsubscribe();
  }

  getVisibleStatus() {
    if (this.visible) {
      return "none"
    }
    return "block";
  }

  setVisibility(status: boolean) {
    var vis = status ? "block" : "none";
    this.renderer.setStyle(this.cardLabel.nativeElement, 'display', vis);
  }

  setPlaying(isPlaying: boolean) {
    isPlaying 
    ? this.renderer.addClass(this.cardLabel.nativeElement, "playing")
    : this.renderer.removeClass(this.cardLabel.nativeElement, "playing");

    this.playing = isPlaying;
  }

  isPlaying() {
    return this.playing;
  }

  playTarget() {
    this.playerService.load(this.item.audioTargetId, this.item.name, this.item.index)
      .then(() => this.playerService.play())
      .catch(() => console.log("Couldn't load item"));
  }

}
