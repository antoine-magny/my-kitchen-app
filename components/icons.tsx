import type { ReactNode } from "react";

/**
 * Icônes SVG partagées de l'application.
 *
 * Toutes les icônes sont dessinées dans un viewBox 24×24 et héritent de la
 * couleur du texte parent (`currentColor`). `size` pilote à la fois la largeur
 * et la hauteur ; `strokeWidth` reste ajustable car l'épaisseur du trait varie
 * légèrement selon les écrans.
 */

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

function StrokeIcon({
  size,
  strokeWidth,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function SearchIcon({ size = 16, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </StrokeIcon>
  );
}

export function ClockIcon({ size = 13, strokeWidth = 2.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </StrokeIcon>
  );
}

export function FlameIcon({ size = 13, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </StrokeIcon>
  );
}

export function ProteinIcon({ size = 13, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M12 22V12M12 12C12 12 8 10 8 6a4 4 0 0 1 8 0c0 4-4 6-4 6z" />
      <path d="M8 22h8" />
    </StrokeIcon>
  );
}

export function MuscleIcon({ size = 12, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M6.5 6.5c3.5-3.5 9-3.5 12 0s3 8.5 0 12-8.5 3-12 0" />
      <path d="M6.5 17.5c-3 3-2 7 2 6" />
      <path d="m10 20 4-4" />
    </StrokeIcon>
  );
}

export function ChevronLeftIcon({ size = 18, strokeWidth = 2.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="m15 18-6-6 6-6" />
    </StrokeIcon>
  );
}

export function ChevronRightIcon({ size = 16, strokeWidth = 2.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="m9 18 6-6-6-6" />
    </StrokeIcon>
  );
}

export function ChevronDownIcon({ size = 14, strokeWidth = 2.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <polyline points="6 9 12 15 18 9" />
    </StrokeIcon>
  );
}

export function CheckIcon({ size = 14, strokeWidth = 2.8, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </StrokeIcon>
  );
}

export function XIcon({ size = 18, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </StrokeIcon>
  );
}

export function PlusIcon({ size = 14, strokeWidth = 2.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </StrokeIcon>
  );
}

export function MinusIcon({ size = 14, strokeWidth = 2.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </StrokeIcon>
  );
}

export function TrashIcon({ size = 14, strokeWidth = 2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </StrokeIcon>
  );
}

export function EditIcon({ size = 15, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </StrokeIcon>
  );
}

export function UsersIcon({ size = 14, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </StrokeIcon>
  );
}

export function CalendarIcon({ size = 14, strokeWidth = 2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </StrokeIcon>
  );
}

export function MoveIcon({ size = 14, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M5 9l-3 3 3 3" />
      <path d="M9 5l3-3 3 3" />
      <path d="M15 19l3 3 3-3" />
      <path d="M19 9l3 3-3 3" />
      <path d="M2 12h20" />
      <path d="M12 2v20" />
    </StrokeIcon>
  );
}

export function ImageIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </StrokeIcon>
  );
}

export function CameraIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </StrokeIcon>
  );
}

export function LinkIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </StrokeIcon>
  );
}

export function StarIcon({ size = 12, className }: Omit<IconProps, "strokeWidth">) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function MoreIcon({ size = 16, className }: Omit<IconProps, "strokeWidth">) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

/** Cœur des favoris — couleurs figées, `light` pour un fond sombre. */
export function HeartIcon({
  filled,
  light,
  size = 16,
}: {
  filled: boolean;
  light?: boolean;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#E85D75" : "none"}
      stroke={filled ? "#E85D75" : light ? "white" : "#7A8F7D"}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function BookmarkIcon({ filled, size = 15 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

/** Spinner monochrome, hérite de la couleur du texte parent. */
export function SpinnerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Spinner aux couleurs de la marque, pour les écrans de chargement pleine page. */
export function SpinnerBrandIcon({ size = 28 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#C8E0CF" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#4A7C59" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
