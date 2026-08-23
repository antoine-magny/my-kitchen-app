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
}

export function IngredientIcon({ name, iconHex, className = "", size = 24, alt = "" }: IngredientIconProps) {
  // Soit on a l'hex/emoji directement, soit on le résout via le nom
  const raw = iconHex || (name ? resolveIcon(name) : undefined);
  const hex = raw ? toIconHex(raw) : DEFAULT_INGREDIENT_ICON;

  return (
    <Image 
      src={`/icons/${hex}.svg`}
      alt={alt || name || 'Icône ingrédient'}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      unoptimized // Les SVGs locaux n'ont pas besoin d'être optimisés par l'API Next.js
    />
  );
}
