import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateMethods } from 'src/app/services/Updater/update-provider';
import { UpdaterService } from 'src/app/services/Updater/updater.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {
  updateStatus: Observable<string>;
  bluetoothFeatureEnabled: boolean;
  dynamicContentFeatureEnabled: boolean;

  constructor(private updater: UpdaterService) { 
    this.bluetoothFeatureEnabled = environment.features.bluetoothUpdate;
    this.dynamicContentFeatureEnabled = environment.features.dynamicContent;
  }

  ngOnInit() {  }

  checkWebUpdate() {
    this.updater.GetUpdater(UpdateMethods.WEB);
    this.updateStatus = this.updater.Update();
    // TODO: What happens when this fails?
  }

}
