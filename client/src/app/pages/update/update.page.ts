import { Component, OnInit } from '@angular/core';
import { faCircleXmark, faCircleCheck, IconDefinition, faCircleDown, faHourglass } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UpdateMethods } from 'src/app/services/Updater/update-provider';
import { UpdateStatus } from 'src/app/services/Updater/update-status';
import { UpdaterService } from 'src/app/services/Updater/updater.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {
  updateStatus: Observable<UpdateStatus>;
  updateStatusIcon: Observable<IconDefinition>;
  updateStatusIconClasses: Observable<string>;
  bluetoothFeatureEnabled: boolean;
  dynamicContentFeatureEnabled: boolean;

  constructor(private updater: UpdaterService) { 
    this.bluetoothFeatureEnabled = environment.features.bluetoothUpdate;
    this.dynamicContentFeatureEnabled = environment.features.dynamicContent;
  }

  ngOnInit() {  }

  checkWebUpdate() {
    this.updater.GetUpdater(UpdateMethods.WEB);
    this.updateStatus = this.updater.UpdateWithStatus()

    this.updateStatusIcon = this.updateStatus.pipe(map(stat => {
      if (stat == UpdateStatus.READY) return faCircleDown
      if (stat == UpdateStatus.UPDATING) return faHourglass
      if (stat == UpdateStatus.SUCCEEDED) return faCircleCheck
      if (stat == UpdateStatus.FAILED) return faCircleXmark
    }));
    this.updateStatusIconClasses = this.updateStatus.pipe(map(stat => {
      let classes = "fa-xl"
      if (stat == UpdateStatus.SUCCEEDED) return `${classes} status-green`;
      if (stat == UpdateStatus.FAILED) return `${classes} status-red`;
      return `${classes} fa-fade status-blue`;
    }));
  }
}
