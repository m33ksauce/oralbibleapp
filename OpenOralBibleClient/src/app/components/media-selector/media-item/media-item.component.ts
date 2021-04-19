import { Component, Input, OnInit } from '@angular/core';
import { MediaListItem } from 'src/app/models/MediaListItem';

@Component({
  selector: 'media-item',
  templateUrl: './media-item.component.html',
  styleUrls: ['./media-item.component.scss'],
})
export class MediaItemComponent implements OnInit {
  @Input() item: MediaListItem;
  @Input() visible: boolean = true;

  constructor() { }

  ngOnInit() {}

}
