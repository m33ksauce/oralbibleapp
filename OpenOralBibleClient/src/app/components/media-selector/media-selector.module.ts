import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MediaSelectorComponent } from './media-selector.component';
import { MediaContainerComponent } from './media-container/media-container.component';
import { MediaItemComponent } from './media-item/media-item.component'

@NgModule({
  declarations: [
    MediaSelectorComponent,
    MediaContainerComponent,
    MediaItemComponent
  ],
  imports: [
    IonicModule,
    CommonModule
  ],
  exports: [MediaSelectorComponent]
})
export class MediaSelectorComponentModule { }
