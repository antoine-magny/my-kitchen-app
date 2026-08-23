export function EditProfileFields({
  firstName,
  email,
  isGuestAccount,
  loading,
  nameInputRef,
  onFirstNameChange,
  onEmailChange,
}: {
  firstName: string;
  email: string;
  isGuestAccount: boolean;
  loading: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  onFirstNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}) {
  return (
    <>
      {isGuestAccount && (
        <div className="flex items-start gap-3 rounded-2xl bg-[#F0F4EF] border border-[#E2EBE3] p-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm" aria-hidden>
            👤
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1C2B1E]">Mode Invité</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#7A8F7D]">
              Renseignez un e-mail et un mot de passe pour enregistrer définitivement votre compte.
            </p>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="edit-firstName"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5A6B5C]"
        >
          Prénom
        </label>
        <input
          ref={nameInputRef}
          id="edit-firstName"
          type="text"
          disabled={loading}
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          placeholder={isGuestAccount ? "Votre prénom (ex : Antoine)" : "Ex : Antoine"}
          className="w-full rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:bg-white focus:ring-4 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="edit-email"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5A6B5C]"
        >
          Adresse e-mail
        </label>
        <input
          id="edit-email"
          type="email"
          disabled={loading}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={isGuestAccount ? "ex : nom@domaine.fr" : "votre.email@exemple.com"}
          className="w-full rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] px-4 py-3 text-sm font-semibold text-[#1C2B1E] placeholder-[#9CA3AF] transition-all focus:border-[#4A7C59] focus:bg-white focus:ring-4 focus:ring-[#4A7C59]/10 focus:outline-none disabled:opacity-60"
        />
      </div>
    </>
  );
}
