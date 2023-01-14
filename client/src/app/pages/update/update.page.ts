import { Component, OnInit } from '@angular/core';
import { faCircleXmark, faCircleCheck, IconDefinition, faCircleDown, faSync } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UpdateMethods } from 'src/app/services/Updater/update-provider';
import { UpdateStatus } from 'src/app/services/Updater/update-status';
import { UpdaterService } from 'src/app/services/Updater/updater.service';
import { environment } from 'src/environments/environment';

interface UpdateStatusIndicatorData {
  icon: IconDefinition,
  classes: string,
  spinAnimation: boolean
}

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})

export class UpdatePage implements OnInit {
  updateStatusIndicator: Observable<UpdateStatusIndicatorData>;
  bluetoothFeatureEnabled: boolean;
  dynamicContentFeatureEnabled: boolean;

  constructor(private updater: UpdaterService) { 
    this.bluetoothFeatureEnabled = environment.features.bluetoothUpdate;
    this.dynamicContentFeatureEnabled = environment.features.dynamicContent;
  }

  ngOnInit() {  }

  checkWebUpdate() {
    this.updater.GetUpdater(UpdateMethods.WEB);
    this.updateStatusIndicator = this.updater.UpdateWithStatus()
      .pipe(map(stat => this.mapUpdateStatus(stat)));
  }

  checkBluetoothUpdate() {

  }

  mapUpdateStatus(status: UpdateStatus) {
    switch(status) {
      case UpdateStatus.READY: {
        return {
          icon: faCircleDown,
          classes: "fa-xl status-orange",
          spinAnimation: false,
        }
      }
      case UpdateStatus.UPDATING: {
        return {
          icon: faSync,
          classes: "fa-xl status-orange",
          spinAnimation: true,
        }
      }
      case UpdateStatus.SUCCEEDED: {
        return {
          icon: faCircleCheck,
          classes: "fa-xl status-green",
          spinAnimation: false,
        }
      }
      case UpdateStatus.FAILED: {
        return {
          icon: faCircleXmark,
          classes: "fa-xl status-red",
          spinAnimation: false,
        }
      }
    }
  }
}
