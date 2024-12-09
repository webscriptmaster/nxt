export interface Type {
  guideLink: string;
  category: Category[] | null;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  delete: boolean;
  documentId: string;
  templates: Template[] | null;
}

export interface Template {
  id?: string;
  favorite?: number | null;
  name?: string;
  thumbnail?: string;
  file?: File;
  order?: number;
  hidden?: boolean;
  fileName?: string;
  sanitizerUrl?: any;
  width?: number;
  height?: number;
  credit?: number;
  isLive?: number;
  qrCode?: boolean;
  pinAsOfferCard?: boolean;
  tags?: any[] | null;
  svg?: string | null;
  svgForUser?: string | null;
  isUpdating?: boolean | null | any;
}

export interface GraphicElement {
  no?: number | null;
  type?: string | null;
  url?: string | null;
  hidden?: boolean;
}

export interface ProspectProfile {
  id: string;
  documentId?: string;
  name: string;
  guideLink?: string;
  order: number;
  delete?: boolean;
  hidden?: boolean;
  profiles?: Profile[] | null;
}

export interface Profile {
  categoryName?: string | null;
  id: string;
  favorite?: number | null;
  isStarting?: boolean;
  name?: string;
  order?: number;
  hidden?: boolean;
  delete?: boolean;
  credit?: number;
  tags: any[] | null;
  svg?: string | null;
  lastUpdated?: any;
  profileUrl?: string;
  thumbnailUrl?: string;
  backgroundUrl?: string;
  backgroundColor?: string;
  dropdownIcon?: string;
  favoriteProfiles?: number | null;
  byPassDropdownIcon?: string;
  watermarkLogo?: string;
  byPassWatermarkLogo?: string;
  buttons?: Button[];
  listColor?: ColorList;
  mediaColorList?: MediaColorList;
}

export interface Button {
  image?: string;
  byPassImage?: string;
  originalName?: string;
  isEdit?: boolean;
  title?: string;
  color?: string;
  order?: number;
  content?: any;
  isExpanded?: boolean;
}

export interface ColorList {
  button: string;
  content: string;
  label: string;
  secondary: string;
  links: string;
  startColor: string;
  endColor: string;
  whitePart: string;
  rectTab: string;
  openedBG: string;
  headerBG1: string;
  headerBG2: string;
  headerBG3: string;
}

export interface MediaColorList {
  text: string;
  startColor: string;
  endColor: string;
  title: string;
  border: string;
  graphicBorder: string;
  tabColor: string;
  activeTabColor: string;
  activeTabBG: string;
  backgroundColor: string;
  lastUpdated: string;
  iconSportColor: string;
}
