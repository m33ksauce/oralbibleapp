import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../pages/home/home.module#HomePageModule'
          }
        ]
      },
      {
        path: 'bible',
        loadChildren: '../pages/bible/bible.module#BiblePageModule'
      },
      {
        path: 'help',
        children: [
          {
            path: '',
            loadChildren: '../pages/help/help.module#HelpPageModule'
          }
        ]
      },
      {
        path: 'player',
        children: [
          {
            path: '',
            loadChildren: '../pages/player/player.module#PlayerPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
