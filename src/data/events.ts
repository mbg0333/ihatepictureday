export interface EventSpecial {
  label: string;
  detail: string;
}

export interface GalleryEvent {
  id: string;
  name: string;
  status: "Live" | "Coming Soon" | "Archive";
  accessCode: string;
  link: string;
  date: string;
  displayDate: string;
  samples: string[];
  specials: EventSpecial[];
}

export const activeGalleries: GalleryEvent[] = [
  {
    id: "central",
    name: "Central Youth Baseball & Softball",
    status: "Live",
    accessCode: "CENTRAL2026",
    link: "https://my.photoday.com/g/CENTRAL2026",
    date: "2026-04-25",
    displayDate: "04/25/2026",
    samples: [],
    specials: [
      { label: "Free Shipping", detail: "With code <span class=\"text-white bg-brand-red px-1.5 py-0.5 rounded mx-1 shadow-[0_0_10px_rgba(224,40,38,0.5)]\">CENTRALFREE</span> (Expires 5/13/2026)" }
    ]
  },
  {
    id: "crockett",
    name: "Crockett Baseball 2026",
    status: "Live",
    accessCode: "CBALL2026",
    link: "https://my.photoday.com/g/CBALL2026",
    date: "2026-04-18",
    displayDate: "04/18/2026",
    samples: [],
    specials: []
  },
  {
    id: "lpar-baseball",
    name: "LPAR Baseball 2026",
    status: "Live",
    accessCode: "LUFKIN2026",
    link: "https://my.photoday.com/g/LUFKIN2026",
    date: "2026-03-21",
    displayDate: "03/21/2026",
    samples: [],
    specials: []
  },
  {
    id: "hms-basketball",
    name: "HMS Basketball 2026",
    status: "Live",
    accessCode: "HMSBBALL26",
    link: "https://my.photoday.com/g/HMSBBALL26",
    date: "2026-02-02",
    displayDate: "02/02/2026",
    samples: [],
    specials: []
  },
  {
    id: "lpar-basketball",
    name: "LPAR Basketball 2026",
    status: "Live",
    accessCode: "LPBALL26",
    link: "https://my.photoday.com/g/LPBALL26",
    date: "2026-01-10",
    displayDate: "01/10/2026",
    samples: [],
    specials: []
  },
  {
    id: "hudson-basketball",
    name: "Hudson Youth Basketball",
    status: "Live",
    accessCode: "HYB26",
    link: "https://my.photoday.com/g/HYB26",
    date: "2025-12-13",
    displayDate: "12/13/2025",
    samples: [],
    specials: []
  }
];
