export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  pincode?: string;
  accuracy: number;
}

export interface UploadedImage {
  id: string;
  base64: string;
  fileType: string;
  size: number;
  width?: number;
  height?: number;
  timestamp: number;
}

export interface UserQuery {
  id: string;
  text: string;
  category: QueryCategory | null;
  location: GeoLocation | null;
  images: UploadedImage[];
  timestamp: number;
  status: "draft" | "submitting" | "processing" | "completed" | "error";
}

export type QueryCategory =
  | "roads"
  | "aadhaar"
  | "electricity"
  | "water"
  | "sanitation"
  | "police"
  | "municipal"
  | "transport"
  | "healthcare"
  | "general";

export interface AISolution {
  id: string;
  queryId: string;
  summary: string;
  steps: ActionStep[];
  relevantAuthority: AuthorityInfo | null;
  estimatedTimeline: string;
  documentsNeeded: string[];
  directLinks: ResourceLink[];
  generatedAt: number;
  confidence: "high" | "medium" | "low";
}

export interface ActionStep {
  stepNumber: number;
  title: string;
  description: string;
  isCritical: boolean;
  estimatedTime?: string;
}

export interface AuthorityInfo {
  department: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  officeAddress?: string;
  jurisdiction?: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  type: "official" | "form" | "tarcking" | "helpline";
}

export interface SessionState {
  currentQuery: UserQuery | null;
  currentSolution: AISolution | null;
  queryHistory: UserQuery[];
  isLocationLoading: boolean;
  error: string | null;
  lastSaved: number | null;
}

export interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  variant?: "full" | "overlay" | "inline";
  progress?: number;
}

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "strong";
  interactive?: boolean;
  onClick?: () => void;
}

export interface LocationPickerProps {
  onLocationSelect: (location: GeoLocation) => void;
  initialLocation?: GeoLocation | null;
  compact?: boolean;
}

export interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}
