import firebase from 'firebase/compat/app';
import { PLANS } from '../shared/const';
import { Profile as ProfileTemplate } from './prospect';
type Timestamp = firebase.firestore.Timestamp;

export interface User {
  id: string;
  completeSignUp: boolean;
  completeAddSport: boolean;
  appSport: 'primary' | 'secondary' | null;
  profileImg: string | null;
  secondarySportProfileImg: string | null;
  firstName: string;
  aboutMe: string;
  lastName: string;
  highSchool: string;
  highSchoolSuffix: 'High School' | 'Club';
  secondaryHighSchool: string;
  secondaryHighSchoolSuffix: 'High School' | 'Club';
  classOf: number;
  email: string;
  sport: string;
  activityTracking: boolean | null;
  primarySport: string;
  primarySportPositions: string[];
  secondarySport: string;
  secondarySportPositions: string[];
  contactEmail: string;
  hudlAccountLink: string;
  youtubeAccountLink: string;
  sportsAccountLink: string;
  phoneNumber: string;
  twitter: string | null;
  instagram: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: number;
  country: string;
  club: string | null;
  athleteOrParentOrCoach: string;
  secondaryAthleteOrParentOrCoach: string;
  teamLogoImg: string | null;
  secondarySportTeamLogoImg: string | null;
  coachCount: number;
  secondarySportCoachCount: number;
  coachTitle: string | null;
  coachFirstName: string;
  secondarySportCoachFirstName: string;
  coachLastName: string;
  secondarySportCoachLastName: string;
  coachPhoneNumber: string;
  secondarySportCoachPhoneNumber: string;
  coachEmail: string;
  isFirstTimeAtCampaign: boolean;
  secondarySportCoachEmail: string;
  completeQuestionnaires: string[] | null;
  completeCamps: string[] | null;
  isShowedHowCollegeCreditWorks: boolean | null;
  isShowedFirstOpenCampaigns: boolean | null;
  isSavingMedia: boolean | null;
  favoriteTemplate: string[] | null;
  favoriteProfile: string[] | null;
  availableTemplate: string[] | null;
  availableProfiles: string[] | null;
  ownTemplates: OwnTemplate[] | null;
  ownProfiles: OwnProfile[] | null;
  schedule?: string | null;
  upcomingPastEvent?: string | null;
  upcomingGameLink?: string | null;
  teamColor1?: string | null;
  teamColor2?: string | null;
  unicode?: string | null;

  secondarySportSchedule?: string | null;
  secondarySportUpcomingPastEvent?: string | null;
  secondarySportUpcomingGameLink?: string | null;
  secondarySportTeamColor1?: string | null;
  secondarySportTeamColor2?: string | null;
  isRecruit?: boolean | null;
  organization?: string | null;
  secondOrganization?: string | null;

  academicInfo: {
    [key: string]: string | number;
  };
  primarySportAthleticInfo: {
    [key: string]: string | number;
  };
  primarySportStats: {
    [key: string]: number;
  };
  secondarySportAthleticInfo: {
    [key: string]: string | number;
  };
  secondarySportStats: {
    [key: string]: number;
  };
  offers: string | null;
  secondarySportOffers: string | null;
  parentInfo: {
    [key: string]: number;
  };
  ownEmailTemplate: {
    [key: string]: string;
  };
  generalEmailTemplate: {
    [key: string]: string;
  };
  personalEmailTemplate: {
    [key: string]: string;
  };
  secondarySportOwnEmailTemplate: {
    [key: string]: string;
  };
  secondarySportGeneralEmailTemplate: {
    [key: string]: string;
  };
  secondarySportPersonalEmailTemplate: {
    [key: string]: string;
  };
  taggedColleges: [string | number];
  connectedGmailToken?: string;
  connectedMicrosoftToken?: string;
  connectedEmail?: string;
  payment: {
    expiresIn: Timestamp;
    firstYearExpiresIn: Timestamp;
  };
  referrals: [{ userId: string; date: Date; status: string }];
  fcmToken: string | null;
  pushNotifications: boolean;
  credits: number;
  lastActivatedPlan: PLANS;
  lastActivePlan: PLANS;
  showedTrialMessage?: boolean;
  canAddSport: boolean;
  availableColleges: string[];
  showedHearAbout: boolean;
  primaryVideoImage: any;

  secondaryVideoImage: any;
  isCommitted: boolean;
  campaignsSent: any[] | null;
  [key: string]: any;
}

export interface Social {
  picture: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  email?: string;
}

export interface SocialResponse {
  additionalUserInfo?: GoogleAdditionalUserInfo | null;
  credential?: Credential | null;
  operationType?: string | null;
  providerId?: string | null;
  _tokenResponse: null;
  user: any;
}

export interface GoogleAdditionalUserInfo {
  isNewUser: boolean;
  profile: Profile;
  providerId: string;
}

interface Profile {
  email: string;
  family_name: string;
  given_name: string;
  granted_scopes: string;
  id: string;
  locale: string;
  name: string;
  picture: string;
  verified_email: string;
}

interface Credential {
  accessToken: string;
  idToken: string;
  pendingToken?: string | null;
  providerId: string;
  signInMethod: string;
}

export interface OwnTemplate {
  id: string | null;
  name: string | null;
  url: string | null;
  pngUrl?: string | null;
  type?: string | null;
  downloadURL?: string | null;
  previewImage?: string | null;
  order?: number | null;
  pinnedToProfile?: boolean | null;
  selectionOrder?: number;
}

export interface OwnProfile {
  id: string | null;
  name: string | null;
  url?: string | null;
  profileUrl?: string | null;
  pngUrl?: string | null;
  thumbnailUrl?: string | null;
  type?: string | null;
  downloadURL?: string | null;
  previewImage?: string | null;
  order?: number | null;
  isLive?: boolean;
}
