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
  optInActive?: boolean;
}

export interface OptInRegistration {
  id: string;
  name: string;
  athleteName?: string;
  phone: string;
  email: string;
  eventId: string;
  eventName: string;
  createdAt: string;
  source?: string;
}
