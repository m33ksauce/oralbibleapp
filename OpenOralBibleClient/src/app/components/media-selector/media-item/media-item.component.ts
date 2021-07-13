import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonCard } from '@ionic/angular';
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
  @ViewChild('card', {read: ElementRef, static: false}) cardLabel: ElementRef

  constructor(
    private renderer: Renderer2,
    private metadataService: MetadataService,
    private playerService: PlayerService
    ) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.setVisibility(false);
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

  playTarget() {
    var media = this.metadataService.getAudioFileFromTarget(this.item.audioTargetId);
    console.log(media);
    this.playerService.loadMedia(media, this.item.name, this.item.index);
    this.playerService.play();
  }

}
