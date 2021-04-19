import { Component, Input, OnInit } from '@angular/core';
import { MediaListItem, MediaType } from 'src/app/models/MediaListItem';

@Component({
  selector: 'media-container',
  templateUrl: './media-container.component.html',
  styleUrls: ['./media-container.component.scss'],
})
export class MediaContainerComponent implements OnInit {
  @Input() item: MediaListItem;
  @Input() expanded: boolean = false;

  constructor() { 
    if (this.expanded == false) {
      
    }
  }

  ngOnInit() {}

  isCategory() {
    return this.item.type == MediaType.Category;
  }

  isAudio() {
    return this.item.type == MediaType.Audio;
  }

}
