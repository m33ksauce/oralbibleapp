import {
  Component
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryMediaService } from '../../services/CategoryMedia/CategoryMedia.service';
import { MediaItem } from 'src/app/models/MediaItem';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-bible',
  templateUrl: 'bible.page.html',
  styleUrls: [ 'bible.page.scss' ]
})

export class BiblePage {
  items: MediaItem[];
  breadcrumbs: MediaItem[];

  constructor(public navCtrl: NavController, public mediaService: CategoryMediaService, public route: ActivatedRoute) {
    this.items = new Array<MediaItem>();
    this.breadcrumbs = new Array<MediaItem>();
  }

  ngOnInit() {
    this.route.params.subscribe(
        params => this.loadMedia(params.id)
      )
  }

  loadMedia(id?: string) {
    this.items = this.mediaService.getAvailable(id)
    this.breadcrumbs = this.mediaService.getBreadcrumbs(id);
  }

  launchTarget(item) {
    this.navCtrl.navigateForward(item.target, {animated: false});
  }

  launchParent(item) {
    var parent = this.mediaService.getCategory(this.mediaService.getParent(item.id));
    this.launchTarget(parent);
  }
}
