import { NumberWithComaPipe } from './number-with-coma.pipe';
import { TwitterTagPipe } from './twitter-tag.pipe';
import { FormatPhone } from './format-phone.pipe';
import { SportWrapPipe } from './sport-wrap.pipe';
import { SportImgPipe } from './sport-img.pipe';
import { FormatPositionsPipe } from './format-positions.pipe';
import { FormatHeightPipe } from './format-height.pipe';
import { CollegeLogoPipe } from './college-logo.pipe';
import { ConferenceLogoPipe } from './conference-logo.pipe';
import { CollegeDivisionPipe } from './college-division.pipe';
import { SafePipe } from './safe.pipe';
import { DateAgoPipe } from './date-ago.pipe';
import { StringToHtmlDirective } from './stringToHtml.pipe';

export const pipes = [
  FormatHeightPipe,
  FormatPositionsPipe,
  SportImgPipe,
  SportWrapPipe,
  FormatPhone,
  TwitterTagPipe,
  CollegeLogoPipe,
  ConferenceLogoPipe,
  NumberWithComaPipe,
  CollegeDivisionPipe,
  SafePipe,
  DateAgoPipe,
  StringToHtmlDirective
];

export * from './stringToHtml.pipe';
export * from './sport-wrap.pipe';
export * from './sport-img.pipe';
export * from './format-positions.pipe';
export * from './format-height.pipe';
export * from './format-phone.pipe';
export * from './twitter-tag.pipe';
export * from './college-logo.pipe';
export * from './conference-logo.pipe';
export * from './number-with-coma.pipe';
export * from './college-division.pipe';
export * from './safe.pipe';
export * from './date-ago.pipe';
