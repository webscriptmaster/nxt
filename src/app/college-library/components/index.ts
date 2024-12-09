import { CollegeCardCampComponent } from './camp/camp.component';
import { CollegeCardComponent } from './college-card/college-card.component';
import { CollegeCardContactsComponent } from './contacts/contacts.component';
import { CollegeCardGenderBarComponent } from './gender-bar/gender-bar.component';
import { CollegeCardInfoComponent } from './info/info.component';
import { CollegeCardQuestionnairesComponent } from './questionnaire/questionnaire.component';
import { CollegeCardSocialsComponent } from './socials/socials.component';
import { CollegeCardUndergraduateStudentsBarComponent } from './undergraduate-students-bar/undergraduate-students-bar.component';

export const components = [
  CollegeCardComponent,
  CollegeCardContactsComponent,
  CollegeCardSocialsComponent,
  CollegeCardQuestionnairesComponent,
  CollegeCardCampComponent,
  CollegeCardInfoComponent,
  CollegeCardUndergraduateStudentsBarComponent,
  CollegeCardGenderBarComponent,
];

export * from './college-card/college-card.component';
export * from './contacts/contacts.component';
export * from './socials/socials.component';
export * from './questionnaire/questionnaire.component';
export * from './camp/camp.component';
export * from './info/info.component';
export * from './undergraduate-students-bar/undergraduate-students-bar.component';
export * from './gender-bar/gender-bar.component';
