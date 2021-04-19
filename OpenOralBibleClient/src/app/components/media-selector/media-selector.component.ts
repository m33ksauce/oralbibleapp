import { Component, OnInit } from '@angular/core';
import { MediaListItem } from 'src/app/models/MediaListItem';
import { MetadataService } from 'src/app/services/Metadata/metadata.service';

@Component({
  selector: 'media-selector',
  templateUrl: './media-selector.component.html',
  styleUrls: ['./media-selector.component.scss'],
})
export class MediaSelectorComponent implements OnInit {
  catalog: MediaListItem[];
  
  constructor(
    public metadataService: MetadataService
  ) { 
    metadataService.getAvailableMedia().subscribe(media => this.catalog = media);
  }

  ngOnInit() {}

}
