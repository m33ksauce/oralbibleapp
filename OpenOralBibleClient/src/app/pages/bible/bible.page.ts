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

  constructor(public navCtrl: NavController, public mediaService: CategoryMediaService, public route: ActivatedRoute) {
    this.items = new Array<MediaItem>();
  }

  ngOnInit() {
    this.route.params.subscribe(
        params => this.items = this.mediaService.getAvailable(params.id)
      )
  }

  launchTarget(item) {
    console.log(item);
    this.navCtrl.navigateForward(item.target, {animated: false});
  }
}
