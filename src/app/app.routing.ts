import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService as AuthGuard } from './auth/auth.guard';

export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'start',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('../app/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('../app/home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'college-library',
    loadChildren: () =>
      import('../app/college-library/college-library.module').then(
        (m) => m.CollegeLibraryModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'recruiting-info',
    loadChildren: () =>
      import('../app/recruiting-info/recruiting-info.module').then(
        (m) => m.RecruitingInfoModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'offers',
    loadChildren: () =>
      import('../app/offers/offers.module').then((m) => m.OffersModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('../app/settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [AuthGuard],
  },

  {
    path: 'create-email',
    loadChildren: () =>
      import('../app/create-email/create-email.module').then(
        (m) => m.CreateEmailModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'drafts',
    loadChildren: () =>
      import('../app/drafts/drafts.module').then((m) => m.DraftsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'prospect-sheet/:id',
    loadChildren: () =>
      import('../app/prospect-sheet/prospect-sheet.module').then(
        (m) => m.ProspectSheetModule
      ),
  },
  {
    path: 'edit-profile',
    loadChildren: () =>
      import('../app/edit-profile/edit-profile.module').then(
        (m) => m.EditProfileModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'add-sport',
    loadChildren: () =>
      import('../app/add-sport/add-sport.module').then((m) => m.AddSportModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'connect',
    loadChildren: () =>
      import('../app/connect-email/connect-email.module').then(
        (m) => m.ConnectEmailModule
      ),
  },
  {
    path: 'refer',
    loadChildren: () =>
      import('../app/refer/refer.module').then((m) => m.ReferModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'my-referrals',
    loadChildren: () =>
      import('../app/my-referrals/my-referrals.module').then(
        (m) => m.MyReferralsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'start',
    loadChildren: () =>
      import('../app/start-screen/start-screen.module').then(
        (m) => m.StartScreenModule
      ),
  },
  {
    path: 'choose-videos-images',
    data: { page: 'VideosImages' },
    loadChildren: () =>
      import('../app/video-image/video-image.module').then(
        (m) => m.VideoImageModule
      ),
  },
  {
    path: 'nxt1-center',
    loadChildren: () =>
      import('../app/nxt1-center/nxt1-center.module').then(
        (m) => m.Nxt1CenterModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'media-pro',
    loadChildren: () =>
      import('../app/prospect-profile/prospect-profile.module').then(
        (m) => m.ProspectProfileModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'email-automation',
    loadChildren: () =>
      import('../app/email-automation/email-automation.module').then(
        (m) => m.EmailAutomationModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'activity',
    loadChildren: () =>
      import('../app/activity/activity.module').then((m) => m.ActivityModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'ai-bot',
    loadChildren: () =>
      import('../app/ai-bot/ai-bot.module').then((m) => m.AiBotModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'athlete/:email/:userName',
    loadChildren: () =>
      import('../app/prospect-profile/prospect-profile.module').then(
        (m) => m.ProspectProfileModule
      ),
  },
  {
    path: 'prospect-profile',
    loadChildren: () =>
      import('../app/live-profile/live-profile.module').then(
        (m) => m.LiveProfileModule
      ),
    // canActivate: [AuthGuard],
  },
  {
    path: 'my-qrcode',
    loadChildren: () =>
      import('../app/my-qrcode/my-qrcode.module').then((m) => m.MyQrcodeModule),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES, { enableTracing: false })],
  exports: [RouterModule],
})
export class routing {}
