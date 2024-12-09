import { EmailsComponent } from "src/app/activity/emails/emails.component";
import { OffersCongratulationsComponent } from "./congratulations/congratulations.component";
import { OffersLogComponent } from "./offers-log/log.component";
import { OffersComponent } from "./offers/offers.component";
import { QuestionnaresComponent } from "src/app/activity/questionnares/questionnares.component";
import { CampsComponent } from "src/app/activity/camps/camps.component";

export const containers = [OffersComponent, OffersCongratulationsComponent, OffersLogComponent, EmailsComponent, QuestionnaresComponent, CampsComponent]

export * from "./offers/offers.component";
export * from "./offers-log/log.component";
export * from "./congratulations/congratulations.component";
export * from "../../activity/emails/emails.component";
export * from "../../activity/questionnares/questionnares.component";
export * from "../../activity/camps/camps.component";