import { Component, OnInit } from '@angular/core';
import { UpdateMethods } from 'src/app/services/Updater/update-provider';
import { UpdaterService } from 'src/app/services/Updater/updater.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {

  constructor(private updater: UpdaterService) { }

  ngOnInit() {
  }

  checkWebUpdate() {
    this.updater.GetUpdater(UpdateMethods.WEB);
    this.updater.Update();
  }

}
