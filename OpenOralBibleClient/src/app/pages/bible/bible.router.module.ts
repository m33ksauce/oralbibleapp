import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BiblePage } from './bible.page'
// import { Selection}

const routes: Routes = [
  {
    path: '',
    component: BiblePage,
  }, 
  {
    path: 'stories/:story',
    component: BiblePage
  },
  {
    path: 'nt/',
    component: BiblePage
  },
  {
    path: 'nt/:book',
    component: BiblePage
  },
  {
    path: 'nt/:book/:chapter',
    component: BiblePage
  },
  {
    path: 'ot/',
    component: BiblePage
  },
  {
    path: 'ot/:book',
    component: BiblePage
  },
  {
    path: 'ot/:book/:chapter',
    component: BiblePage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class BiblePageRoutingModule {}