// FIX: Removed incorrect import. CaseStudySection is defined in this file.

export type View = 'home' | 'caseStudy' | 'admin' | 'login';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  caseStudyId: string;
}

// Section-based CaseStudy type for the advanced editor
export interface HeroSection {
  enabled: boolean;
  headline: string;
  subheading: string;
  text: string;
  imageUrl?: string;
  imageAssetId?: string;
}

export interface OverviewSection {
  enabled: boolean;
  title: string;
  summary: string;
  metrics: string; // Newline-separated "Key: Value"
}

export interface ProblemSection {
  enabled: boolean;
  title: string;
  description: string;
}

export interface ProcessSection {
  enabled: boolean;
  title: string;
  description: string;
  steps: string; // Newline-separated steps
}

export interface ShowcaseSection {
  enabled: boolean;
  title: string;
  description: string;
  features: string; // Newline-separated features
}

export interface ReflectionSection {
  enabled: boolean;
  title: string;
  content: string;
  learnings: string; // Newline-separated learnings
}

export interface GallerySection {
    enabled: boolean;
    images: string[]; // Array of image URLs
}

export interface DocumentSection {
    enabled: boolean;
    url: string;
}

export interface VideoSection {
    enabled: boolean;

    url: string;
    caption: string;
}

export interface FigmaSection {
    enabled: boolean;
    url: string;
    caption: string;
}

export interface MiroSection {
    enabled: boolean;
    url: string;
    caption: string;
}

export interface LinksSection {
    enabled: boolean;
    title: string;
    items: string; // Newline-separated "Name|URL"
}


export interface CaseStudy {
  id: string;
  title: string; // Project Title, serves as the main identifier
  template: 'default' | 'ghibli' | 'modern'; // Template choice
  content?: string; // For pre-rendered HTML
  sections: {
    hero: HeroSection;
    overview: OverviewSection;
    problem: ProblemSection;
    process: ProcessSection;
    showcase: ShowcaseSection;
    reflection: ReflectionSection;
    gallery: GallerySection;
    document: DocumentSection;
    video: VideoSection;
    figma: FigmaSection;
    miro: MiroSection;
    links: LinksSection;
  };
}


export interface CarouselImage {
  id: string;
  src: string;
  title: string;
  description: string;
}

export interface MyStorySection {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
}

export interface AISettings {
  id: string;
  apiKey: string;
  selectedModel: string;
  isConfigured: boolean;
  lastUpdated: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  isRecommended?: boolean;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  iconUrl?: string; // Optional custom image URL
  color: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  iconUrl?: string; // Optional custom image URL
  color: string;
}

export interface MagicToolbox {
  id: string;
  title: string;
  subtitle: string;
  categories: SkillCategory[];
  tools: Tool[];
}

export interface JourneyItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  isActive?: boolean;
}

export interface MyJourney {
  id: string;
  title: string;
  subtitle: string;
  items: JourneyItem[];
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

export interface ContactSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  email: string;
  location: string;
  socialLinks: SocialLink[];
  resumeUrl: string;
  resumeButtonText: string;
}

export interface CVVersion {
  id: string;
  name: string;
  type: 'indian' | 'europass' | 'global';
  fileUrl?: string;
  googleDriveUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadDate?: string;
  isActive: boolean;
}

export interface CVSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  versions: CVVersion[];
}

// Helper types derived from the main CaseStudy interface
export type CaseStudySectionName = keyof CaseStudy['sections'];
export type CaseStudySection = CaseStudy['sections'][CaseStudySectionName];