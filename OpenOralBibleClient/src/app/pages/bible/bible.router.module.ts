import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BiblePage } from './bible.page'
// import { Selection}

const routes: Routes = [
  { path: '', component: BiblePage, },
  { path: ':id', component: BiblePage },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class BiblePageRoutingModule {}