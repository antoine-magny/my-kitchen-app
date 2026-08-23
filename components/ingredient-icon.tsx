import Image from 'next/image';
import { DEFAULT_INGREDIENT_ICON, resolveIcon, toIconHex } from '@/lib/ingredients';

interface IngredientIconProps {
  /** Le nom de l'ingrédient pour lequel trouver l'icône, OU... */
  name?: string;
  /** Le code hex ou emoji de l'icône directement */
  iconHex?: string;
  className?: string;
  size?: number;
  alt?: string;
  /** Si vrai et que l'icône est l'ensemble vide (ou absente), n'affiche rien (null) */
  hideIfEmpty?: boolean;
}

export function IngredientIcon({ name, iconHex, className = "", size = 24, alt = "", hideIfEmpty = false }: IngredientIconProps) {
  // Soit on a l'hex/emoji directement, soit on le résout via le nom
  const raw = iconHex || (name ? resolveIcon(name) : undefined);
  
  const isEmptySet = !raw || raw === DEFAULT_INGREDIENT_ICON || raw === "2205" || raw === "∅" || raw === "Ø" || raw === "ø";

  if (isEmptySet && hideIfEmpty) {
    return null;
  }

  if (!raw) {
    return (
      <Image 
        src={`/icons/${DEFAULT_INGREDIENT_ICON}.svg`}
        alt={alt || name || 'Icône ingrédient'}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        unoptimized
      />
    );
  }

  const isHexCode = /^[0-9A-Fa-f]{2,6}(-[0-9A-Fa-f]{2,6})*$/.test(raw);

  if (isHexCode) {
    const hex = toIconHex(raw);
    return (
      <Image 
        src={`/icons/${hex}.svg`}
        alt={alt || name || 'Icône ingrédient'}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        unoptimized
      />
    );
  }

  // It's a native emoji
  return (
    <span 
      className={`flex items-center justify-center ${className}`} 
      style={{ fontSize: size * 0.8, lineHeight: 1, width: size, height: size, minWidth: size, minHeight: size }}
      aria-hidden
    >
      {raw}
    </span>
  );
}
