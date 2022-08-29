import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { MediaListItem } from 'src/app/models/MediaListItem';
import { MetadataService } from 'src/app/services/Metadata/metadata.service';

@Component({
  selector: 'media-selector',
  templateUrl: './media-selector.component.html',
  styleUrls: ['./media-selector.component.scss'],
})
export class MediaSelectorComponent implements OnInit {
  catalog: Observable<MediaListItem[]>;
  
  constructor(
    public metadataService: MetadataService
  ) {}

  ngOnInit() {
    this.catalog = this.metadataService.getAvailableMedia();
    // TODO: What happens if this value returns an error?
  }

}
