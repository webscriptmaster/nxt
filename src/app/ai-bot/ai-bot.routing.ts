import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AiBotComponent } from './ai-bot.component';

const routes: Routes = [
  {
    path: '',
    component: AiBotComponent,
    data: { page: 'AiBot' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
