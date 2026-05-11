export interface EventSpecial {
  label: string;
  detail: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface GalleryEvent {
  id: string;
  name: string;
  status: "Live" | "Coming Soon" | "Archive" | "Advance Pay Available";
  accessCode: string;
  link: string;
  date: string;
  displayDate: string;
  samples: string[];
  specials: EventSpecial[];
}
