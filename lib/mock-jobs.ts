// Placeholder job data for the Job Portal mockup.
// TODO: replace this entire file with a real job-source API integration (Adzuna, per project scope).
export interface Job {
  id: string;
  title: string;
  employer: string;
  city: string;
  country: string;
  type: "Full-time" | "Part-time" | "Contract";
  category: "ESL" | "Primary" | "Secondary" | "Special Education";
  image: string;
  applyUrl: string;
}

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "ESL Teacher",
    employer: "Bangkok Language Academy",
    city: "Bangkok",
    country: "Thailand",
    type: "Full-time",
    category: "ESL",
    image: "/assets/img/event/event2-1.jpg",
    applyUrl: "#",
  },
  {
    id: "job-2",
    title: "Primary School Teacher",
    employer: "Hanoi International School",
    city: "Hanoi",
    country: "Vietnam",
    type: "Full-time",
    category: "Primary",
    image: "/assets/img/event/event2-2.jpg",
    applyUrl: "#",
  },
  {
    id: "job-3",
    title: "Secondary Math Teacher",
    employer: "Al Noor Academy",
    city: "Dubai",
    country: "UAE",
    type: "Contract",
    category: "Secondary",
    image: "/assets/img/event/event2-3.jpg",
    applyUrl: "#",
  },
  {
    id: "job-4",
    title: "Special Education Coordinator",
    employer: "Seoul Bridges School",
    city: "Seoul",
    country: "South Korea",
    type: "Full-time",
    category: "Special Education",
    image: "/assets/img/event/event2-4.jpg",
    applyUrl: "#",
  },
  {
    id: "job-5",
    title: "ESL Teacher",
    employer: "Madrid Language Institute",
    city: "Madrid",
    country: "Spain",
    type: "Part-time",
    category: "ESL",
    image: "/assets/img/event/event2-5.jpg",
    applyUrl: "#",
  },
  {
    id: "job-6",
    title: "Primary School Teacher",
    employer: "Mexico City British School",
    city: "Mexico City",
    country: "Mexico",
    type: "Full-time",
    category: "Primary",
    image: "/assets/img/event/event2-6.jpg",
    applyUrl: "#",
  },
  {
    id: "job-7",
    title: "Secondary Science Teacher",
    employer: "Shanghai World Academy",
    city: "Shanghai",
    country: "China",
    type: "Full-time",
    category: "Secondary",
    image: "/assets/img/event/event2-1.jpg",
    applyUrl: "#",
  },
  {
    id: "job-8",
    title: "Special Education Teacher",
    employer: "Warsaw Inclusive School",
    city: "Warsaw",
    country: "Poland",
    type: "Contract",
    category: "Special Education",
    image: "/assets/img/event/event2-2.jpg",
    applyUrl: "#",
  },
  {
    id: "job-9",
    title: "ESL Teacher",
    employer: "Tokyo Global Institute",
    city: "Tokyo",
    country: "Japan",
    type: "Full-time",
    category: "ESL",
    image: "/assets/img/event/event2-3.jpg",
    applyUrl: "#",
  },
  {
    id: "job-10",
    title: "Primary School Teacher",
    employer: "Doha Learning Center",
    city: "Doha",
    country: "Qatar",
    type: "Part-time",
    category: "Primary",
    image: "/assets/img/event/event2-4.jpg",
    applyUrl: "#",
  },
];
