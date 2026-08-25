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

export function FilterIcon({ size = 16, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M4 8h4" />
      <path d="M12 8h8" />
      <circle cx="10" cy="8" r="2" />
      <path d="M4 16h10" />
      <path d="M18 16h2" />
      <circle cx="16" cy="16" r="2" />
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

export function EyeIcon({ size = 20, strokeWidth = 1.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </StrokeIcon>
  );
}

export function EyeOffIcon({ size = 20, strokeWidth = 1.5, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </StrokeIcon>
  );
}

/** Logo Google officiel (couleurs de marque, pas `currentColor`). */
export function GoogleIcon({ size = 18, className }: Omit<IconProps, "strokeWidth">) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
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

export function ChefHatIcon({ size = 14, strokeWidth = 2.2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
      <path d="M6 17h12" />
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

export function HomeIcon({ size = 20, strokeWidth = 2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
    </StrokeIcon>
  );
}

export function BookIcon({ size = 20, strokeWidth = 2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </StrokeIcon>
  );
}

export function FridgeIcon({ size = 20, strokeWidth = 2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <line x1="6" y1="10" x2="18" y2="10" />
      <line x1="9" y1="5.5" x2="9" y2="7" />
      <line x1="9" y1="13.5" x2="9" y2="16" />
    </StrokeIcon>
  );
}

export function CartIcon({ size = 20, strokeWidth = 2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <circle cx="9" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
    </StrokeIcon>
  );
}

export function SettingsIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </StrokeIcon>
  );
}

export function ChartIcon({ size = 18, strokeWidth = 2.4, className }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth} className={className}>
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="8" />
      <line x1="18" y1="20" x2="18" y2="4" />
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
