import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { IonCard } from '@ionic/angular';
import { MediaListItem, MediaType } from 'src/app/models/MediaListItem';
import { MediaItemComponent } from '../media-item/media-item.component';

@Component({
  selector: 'media-container',
  templateUrl: './media-container.component.html',
  styleUrls: ['./media-container.component.scss'],
})
export class MediaContainerComponent implements OnInit, AfterViewInit {
  @Input() item: MediaListItem;
  @Input() expanded: boolean = false;
  @ViewChild('card', {read: ElementRef, static: false}) cardLabel: ElementRef
  @ViewChildren(MediaContainerComponent) childCats: Array<MediaContainerComponent>;
  @ViewChildren(MediaItemComponent) childMedia: Array<MediaItemComponent>;

  constructor(public renderer: Renderer2) { }

  ngOnInit() {
    console.log(this.childCats);
  }

  ngAfterViewInit() {
    this.collapse();
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
      this.expanded = false;
      return;
    }
    this.expand();
    this.expanded = true;
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
    this.setChildVis(false);
    this.childCats.forEach(c => c.collapse());
  }

  expand() {
    this.setChildVis(true);
  }

}
