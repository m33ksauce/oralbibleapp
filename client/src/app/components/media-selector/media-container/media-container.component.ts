import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { IonCard } from '@ionic/angular';
import { MediaListItem, MediaType } from 'src/app/models/MediaListItem';
import { environment } from 'src/environments/environment';
import { MediaItemComponent } from '../media-item/media-item.component';

@Component({
  selector: 'media-container',
  templateUrl: './media-container.component.html',
  styleUrls: ['./media-container.component.scss'],
})
export class MediaContainerComponent implements OnInit, AfterViewInit {
  @Input() item: MediaListItem;
  @Input() expanded: boolean = false;
  @ViewChild('card', { read: ElementRef }) cardLabel: ElementRef
  @ViewChildren(MediaContainerComponent) childCats: Array<MediaContainerComponent>;
  @ViewChildren(MediaItemComponent) childMedia: Array<MediaItemComponent>;

  constructor(public renderer: Renderer2) { }

  ngOnInit() {  }

  ngAfterViewInit() {
    this.collapse();
  }

  ngDoCheck() {
    if (!environment.features.mediaCanCollapseWhenPlaying) this.expandIfChildPlaying()
  }

  isCategory() {
    return this.item.type == MediaType.Category;
  }

  isAudio() {
    return this.item.type == MediaType.Audio;
  }

  toggleExpand() {
    if (this.expanded) {
      this.collapse();
      return;
    }
    this.expand();
  }

  expandIfChildPlaying() {
    if (this.childMedia != undefined) {
      this.childMedia.forEach(child => {
        if (child.isPlaying()) this.expand();
      })
    }
    if (this.childCats != undefined) {
      this.childCats.forEach(cat => {
        if (cat.expanded) this.expand();
      })
    }
  }

  setVisibility(status: boolean) {
    var vis = status ? "block" : "none";
    if(this.isCategory()) {
      this.renderer.setStyle(this.cardLabel.nativeElement, 'display', vis);
    }
    this.childMedia.forEach(c => c.setVisibility(status));
  }

  private setChildVis(status: boolean) {
    this.childCats.forEach(c => c.setVisibility(status));
    this.childMedia.forEach(c => c.setVisibility(status));
  }

  collapse() {
    var canCollapse = true;
    this.childMedia.forEach(media => {
      if (media.isPlaying()) canCollapse = false;
    })
    if (environment.features.mediaCanCollapseWhenPlaying) canCollapse = true;
    if (canCollapse) {  
      this.setChildVis(false);
      this.childCats.forEach(c => c.collapse());
      this.expanded = false;
    }
  }

  expand() {
    this.setChildVis(true);
    this.expanded = true;
  }

}
