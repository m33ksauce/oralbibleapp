import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateMethods } from 'src/app/services/Updater/update-provider';
import { UpdaterService } from 'src/app/services/Updater/updater.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {
  updateStatus: Observable<string>;

  constructor(private updater: UpdaterService) { }

  ngOnInit() {
  }

  checkWebUpdate() {
    this.updater.GetUpdater(UpdateMethods.WEB);
    this.updateStatus = this.updater.Update();
  }

}
