import { EyeIcon, EyeOffIcon } from "@/components/icons";

export function EditProfilePasswordFields({
  isGuestAccount,
  loading,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
}: {
  isGuestAccount: boolean;
  loading: boolean;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}) {
  return (
    <div className="pt-1">
      <div className="rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1C2B1E]">
            {isGuestAccount ? "Créer un mot de passe" : "Changer de mot de passe"}
          </span>
          <span className="text-[11px] font-medium text-[#7A8F7D] bg-white px-2 py-0.5 rounded-md border border-[#E2EBE3]">
            optionnel
          </span>
        </div>

        <div>
          <label
            htmlFor="edit-password"
            className="mb-1 block text-xs font-medium text-[#5A6B5C]"
          >
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="edit-password"
              type={showPassword ? "text" : "password"}
              disabled={loading}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              disabled={loading}
              onClick={onTogglePassword}
              className="absolute top-1/2 right-2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-[#7A8F7D] hover:bg-[#F0F4EF] hover:text-[#1C2B1E] transition-colors disabled:opacity-40"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="edit-confirm-password"
            className="mb-1 block text-xs font-medium text-[#5A6B5C]"
          >
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              id="edit-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              disabled={loading}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              disabled={loading}
              onClick={onToggleConfirmPassword}
              className="absolute top-1/2 right-2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-[#7A8F7D] hover:bg-[#F0F4EF] hover:text-[#1C2B1E] transition-colors disabled:opacity-40"
              aria-label={
                showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"
              }
            >
              {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-[#7A8F7D]">
          {isGuestAccount
            ? "Le mot de passe vous permettra de vous reconnecter plus tard avec votre adresse mail."
            : "Laissez vide pour conserver votre mot de passe actuel."}
        </p>
      </div>
    </div>
  );
}
