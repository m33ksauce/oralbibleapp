import {
  Component
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../../models/Category';
import { BibleService } from '../../services/bible/bible.service';

@Component({
  selector: 'app-bible',
  templateUrl: 'bible.page.html',
  styleUrls: [ 'bible.page.scss' ]
})

export class BiblePage {
  items: Array<Object>;

  constructor(private router: Router, public bibleService: BibleService, public route: ActivatedRoute) {
    this.items = new Array<Object>();
  }

  ngOnInit() {
    this.items = this.bibleService.getAvailable();
    this.route.params.subscribe(
        params => console.log(params)
      )
  }

  launchTarget(item) {
    console.log("here");
    this.router.navigate([item.target]);
  }
}

//export class ScripturePage extends