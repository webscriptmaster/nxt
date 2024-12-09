import {
  animate,
  query,
  style,
  transition,
  trigger,
  group,
  animateChild,
} from '@angular/animations';

const leftToRight =
  'Start => SignIn, Home => MyQrcode, ProspectProfile => ProspectProfile1, LiveProfile => EditProfileMain, ProspectProfile => EditProfileMain, Home => LiveProfile, ProspectProfile => Profile, ProspectProfile => ProspectProfileTemplate, Home => AiBot, EditProfileMain => VideosImages, EditProfileMain => Activity, Home => Activity, Home => ProspectProfile, EmailAutomation => CampaignSent, Home => EmailAutomation, EditProfileMain => AboutMe, Notifications => Home, Offers => Notifications, Templates => DynamicTemplate, Home => Templates, Home => NXT1Center, Home => CollegeLibrary, AthleticInfo => VideosImages, VideosImages => Stats, Home => ProspectSheet, Home => RecruitingInfo, Home => EditProfileMain, Home => Settings, Settings => SettingsAccountInfo, Settings => MyReferrals, Settings => SettingsFaq, Settings => SettingsRecruitingProcess, Settings => SettingsContactUs, Settings => EditProfileMain, SettingsAccountInfo => EditProfileMain, Home => OffersLog, Refer => MyReferrals, ChooseSport => ChoosePositions, ChoosePositions => General, ChoosePositions => ContactInfo, General => ContactInfo, ContactInfo => CoachInfo, CoachInfo => AcademicInfo, AcademicInfo => AthleticInfo, AthleticInfo => Stats, Stats => Offers, Offers => Complete, Complete => ProspectSheet, ProspectSheet => Templates, Templates => Template, Templates => HowItWorks, HowItWorks => Notifications, Notifications => Home, EditProfileMain => Templates, EditProfileMain => General, General => Positions, EditProfileMain => ContactInfo, EditProfileMain => AcademicInfo, EditProfileMain => AthleticInfo, EditProfileMain => CoachInfo, EditProfileMain => Stats, Welcome => General, General => ChooseSport, SignIn => SignUp';
const rightToLeft =
  'SignIn => Start, MyQrcode => Home, ProspectProfile1 => ProspectProfile, EditProfileMain => LiveProfile, LiveProfile => ProspectProfile, LiveProfile => Home, Profile => ProspectProfile, ProspectProfileTemplate => ProspectProfile, AiBot => Home, VideosImages => EditProfileMain, Activity => EditProfileMain, Activity => Home, ProspectProfile => Home, CampaignSent => EmailAutomation, EmailAutomation => Home, AboutMe => EditProfileMain, Home => Notifications, Notifications => Offers, DynamicTemplate => Templates, Templates => Home, NXT1Center => Home, CollegeLibrary => Home, VideosImages => AthleticInfo, Stats => VideosImages, ProspectSheet => Home, RecruitingInfo => Home, EditProfileMain => Home, Settings => Home, SettingsAccountInfo => Settings, MyReferrals => Settings, SettingsFaq => Settings, SettingsContactUs => Settings, OffersLog => Home, MyReferrals => Refer, ChoosePositions => ChooseSport, General => ChoosePositions, ContactInfo => ChoosePositions,  ContactInfo => General, CoachInfo => ContactInfo, AcademicInfo => CoachInfo, AthleticInfo => AcademicInfo, Stats => AthleticInfo, Offers => Stats, Complete => Offers, ProspectSheet => Complete, Templates => ProspectSheet, Template => Templates, HowItWorks => Templates, General => EditProfileMain, Positions => General, Templates => EditProfileMain, ContactInfo => EditProfileMain, AcademicInfo => EditProfileMain, AthleticInfo => EditProfileMain, CoachInfo => EditProfileMain, Stats => EditProfileMain, General => Welcome, ChooseSport => General, SignUp => SignIn';
const bottomToTop =
  'CollegeLibrary => Drafts, OffersLog => Offers, Home => SettingsContactUs, Home => Refer, Home => ChooseSport';
const topToBottom =
  'Drafts => CollegeLibrary, SettingsRecruitingProcess => Settings, Offers => OffersLog, SettingsContactUs => Home, Refer => Home, ChooseSport => Home';
const fade =
  'ProspectSheet <=> EditProfileMain, Offers => OffersCongratulations, OffersCongratulations => Home, Templates <=> Bio, SignIn <=> LoginHelp, SignIn => Welcome, SignUp => Welcome';
export function mobileRouterAnimation() {
  return trigger('triggerName', [
    // Left to Right
    transition(leftToRight, [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
        }),
      ]),
      query(':enter', [style({ right: '-100%', opacity: 1 })]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('150ms ease-out', style({ right: '100%', opacity: 1 })),
        ]),
        query(':enter', [
          animate('150ms ease-out', style({ right: '0%', opacity: 1 })),
        ]),
      ]),
      query(':enter', animateChild()),
    ]),
    // Right to Left
    transition(rightToLeft, [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ]),
      query(':enter', [style({ left: '-100%', opacity: 1 })]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('150ms ease-out', style({ left: '100%', opacity: 1 })),
        ]),
        query(':enter', [
          animate('150ms ease-out', style({ left: '0%', opacity: 1 })),
        ]),
      ]),
      query(':enter', animateChild()),
    ]),
    // Bottom to Top
    transition(bottomToTop, [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '100%',
        }),
      ]),
      query(':enter', [style({ bottom: '-100%', opacity: 1 })]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('150ms ease-out', style({ bottom: '100%', opacity: 1 })),
        ]),
        query(':enter', [
          animate('150ms ease-out', style({ bottom: '0%', opacity: 1 })),
        ]),
      ]),
      query(':enter', animateChild()),
    ]),
    // Top To Bottom
    transition(topToBottom, [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          width: '100%',
          height: '100%',
        }),
      ]),
      query(':enter', [style({ top: '-100%', opacity: 1 })]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('150ms ease-out', style({ top: '100%', opacity: 1 })),
        ]),
        query(':enter', [
          animate('150ms ease-out', style({ top: '0%', opacity: 1 })),
        ]),
      ]),
      query(':enter', animateChild()),
    ]),
    // Fade
    transition(fade, [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 1,
        }),
      ]),
      query(':enter', [style({ opacity: 0 })]),
      query(':leave', animateChild()),
      group([
        query(':leave', [animate('150ms ease-out', style({ opacity: 0 }))]),
        query(':enter', [animate('150ms ease-out', style({ opacity: 1 }))]),
      ]),
      query(':enter', animateChild()),
    ]),
  ]);
}

export function desktopRouterAnimation() {
  return trigger('triggerName', []);
}
