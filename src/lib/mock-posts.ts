import type { TaskKey } from "./site-config";
import type { SitePost } from "./site-connector";

const taskSeeds: Record<TaskKey, string> = {
  listing: "ksc-listing",
  classified: "ksc-classified",
  article: "ksc-article",
  image: "ksc-image",
  profile: "ksc-profile",
  social: "ksc-social",
  pdf: "ksc-pdf",
  org: "ksc-org",
  sbm: "ksc-sbm",
  comment: "ksc-comment",
};

const taskTitles: Record<TaskKey, string[]> = {
  listing: [
    "Harbour City Physio & Recovery",
    "North Shore Running Co.",
    "Coastal Swim Academy",
    "Urban Climb Collective",
    "Regional Rugby Union Hub",
  ],
  classified: [
    "Canon RF 70–200 f/2.8 — match-ready kit",
    "Sideline media vest — unused",
    "Seeking second shooter for AFL round",
    "Studio strobe kit for portrait series",
    "Garage slot near MCG for match day",
  ],
  article: [
    "Why Floodlights Turn Every Oval Into a Stage",
    "Training Loads, Rest Weeks, and What Fans Never See",
    "From Terrace Chants to Quiet Shutter Speeds",
    "Covering Finals in the Rain: A Photographer's Checklist",
    "Long-Form Profiles Without the Athlete Clichés",
  ],
  image: [
    "Sundown Warm-Up: Oval Shadows",
    "Centre Court, Frozen Mid-Rally",
    "Pool Deck Reflections, Heat Two",
    "Opening Ceremony: Crowd as a Sea of Colour",
    "Locker Room Light, Minutes Before Kickoff",
  ],
  profile: [
    "Jordan Ellis — sideline photographer",
    "Samira Cho — sports essayist",
    "Ollie Hart — motion & stills",
    "The Terrace Collective",
    "Riley Ng — junior swim beat",
  ],
  social: [
    "This week's best frames from members",
    "Call for pitches: winter codes",
    "Gallery refresh — netball finals set",
    "New contributor guidelines",
    "Behind the lens: MCG tunnel walk",
  ],
  pdf: [
    "Match-day shot list (printable)",
    "Stadium access & credential checklist",
    "Colour grading notes for grass & skin",
    "Caption style guide — Kayo Sport Connect",
    "Consent & model release template pack",
  ],
  org: [
    "AFL Photographers Guild",
    "Women in Sports Media AU",
    "Community Athletics Network",
    "Surf Lifesaving Visual Archive",
    "Paralympic Storytellers Collective",
  ],
  sbm: [
    "Essential reads on sports narrative",
    "Lighting references — indoor arenas",
    "Audio gear for mixed-zone interviews",
    "Rights-cleared stock for editors",
    "Calendar: major codes 2026",
  ],
  comment: [
    "Re: ethics of shooting injured players",
    "Thread: cropping for impact vs context",
    "On crediting amateur ground photographers",
    "Hot take: monochrome for night footy",
    "Reply: filing from the tunnel in 10 minutes",
  ],
};

const taskCategories: Record<TaskKey, string[]> = {
  listing: ["Recovery", "Run", "Swim", "Climb", "Rugby"],
  classified: ["Gear", "Gear", "Gigs", "Gear", "Spaces"],
  article: ["Photo essay", "Training", "Culture", "Matchday", "Profiles"],
  image: ["Oval", "Court", "Aquatics", "Stadium", "Behind the scenes"],
  profile: ["Photographer", "Writer", "Video", "Collective", "Junior beat"],
  social: ["Community", "Editorial", "Gallery", "Guidelines", "BTS"],
  pdf: ["Field kit", "Ops", "Post", "Style", "Legal"],
  org: ["Partners", "Advocacy", "Grassroots", "Archive", "Paralympic"],
  sbm: ["Reading", "Lighting", "Audio", "Assets", "Planning"],
  comment: ["Ethics", "Craft", "Credit", "Opinion", "Workflow"],
};

const summaryByTask: Record<TaskKey, string> = {
  listing: "Verified sport-adjacent business or venue listing.",
  classified: "Member-listed gear, gigs, or spaces for sport storytellers.",
  article: "Editorial long-read from the Kayo Sport Connect desk.",
  image: "Image-led post: frames from training, match day, or culture.",
  profile: "Public profile for a contributor or collective.",
  social: "Community bulletin from the Kayo Sport Connect network.",
  pdf: "Downloadable resource for photographers and editors.",
  org: "Partner organisation spotlight.",
  sbm: "Curated bookmark for research and reference.",
  comment: "Discussion or response on craft and ethics.",
};

const articleSummaries = [
  "How LED banks and twilight colour temperature changed the way we compose wide stadium frames—and why editors now ask for RAW.",
  "A week inside a high-performance unit: what load monitoring charts mean for the story you file from the training paddock.",
  "Sound shapes a stadium as much as light. Notes on shooting supporters without turning people into props.",
  "Rain gear, lens hoods, and the one towel that saves a finals shoot when the weather turns in the third quarter.",
  "Interview structure, fact-checking with clubs, and letting athletes sound like themselves instead of press-kit quotes.",
];

const imageSummaries = [
  "Warm grass, long shadows, and the last ten minutes before warm-up when the oval feels almost empty.",
  "High shutter, hard lines: freezing a serve when both feet leave the ground.",
  "Water texture, lane ropes, and reflections that read cleaner in colour than you expect.",
  "Wide glass, slow sync flash on crowd detail—colour blocks instead of faces.",
  "Single overhead tube, tape on the floor, stillness before the room fills with noise.",
];

const auCities = ["Melbourne, VIC", "Sydney, NSW", "Brisbane, QLD", "Perth, WA", "Adelaide, SA"];

const randomFrom = (items: string[], index: number) =>
  items[index % items.length];

const summaryFor = (task: TaskKey, index: number) => {
  if (task === "article") return articleSummaries[index] ?? summaryByTask.article;
  if (task === "image") return imageSummaries[index] ?? summaryByTask.image;
  return summaryByTask[task];
};

const buildImage = (task: TaskKey, index: number) =>
  `https://picsum.photos/seed/${taskSeeds[task]}-${index}/1200/800`;

export const getMockPostsForTask = (task: TaskKey): SitePost[] => {
  return Array.from({ length: 5 }).map((_, index) => {
    const title = taskTitles[task][index];
    const category = randomFrom(taskCategories[task], index);
    const slug = `${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const summary = summaryFor(task, index);

    return {
      id: `${task}-mock-${index + 1}`,
      title,
      slug,
      summary,
      content: {
        type: task,
        category,
        location: auCities[index % auCities.length],
        description: summary,
        website: "https://kayosportconnect.com",
        phone: "+61 400 000 000",
      },
      media: [{ url: buildImage(task, index), type: "IMAGE" }],
      tags: [task, category],
      authorName: "Kayo Editorial Desk",
      publishedAt: new Date().toISOString(),
    };
  });
};
