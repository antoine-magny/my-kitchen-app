/**
 * Injecte un script exécuté de façon synchrone pendant le parsing HTML,
 * avant l'hydratation React (utile pour éviter un flash de contenu selon
 * une préférence client comme le thème). Voir la doc Next.js :
 * "Preventing flash before hydration".
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
