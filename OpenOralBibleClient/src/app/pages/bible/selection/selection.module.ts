import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectionPage } from './selection.page';

const routes: Routes = [
  {
    path: 'story/:story',
    component: SelectionPage
  },
  {
    path: 'scripture/:testament/:book/:chapter',
    component: SelectionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SelectionPage]
})
export class SelectionPageModule {}
