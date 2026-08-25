"use client";

import { type FormEvent, useState } from "react";
import { CheckIcon, ExternalLinkIcon, MailIcon, SpinnerIcon } from "@/components/icons";
import { CONTACT_TOPICS, type ContactTopicId, SUPPORT_EMAIL } from "@/lib/help-data";

type HelpContactFormProps = {
  userEmail?: string;
  onClose: () => void;
};

export function HelpContactForm({ userEmail = "", onClose }: HelpContactFormProps) {
  const [topic, setTopic] = useState<ContactTopicId>("question");
  const [email, setEmail] = useState(userEmail);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    // Simulation réaliste de soumission
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `[My Kitchen] ${CONTACT_TOPICS.find((t) => t.id === topic)?.label ?? "Support"}`,
  )}&body=${encodeURIComponent(message)}`;

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D1DDD2] bg-[#FAFBF9] p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2EC] text-[#4A7C59]">
          <CheckIcon size={24} />
        </div>
        <h3 className="mt-3 font-lora text-base font-bold text-[#1C2B1E]">
          Message envoyé avec succès !
        </h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#7A8F7D]">
          Merci pour votre retour. Notre équipe vous répondra par email dans les plus brefs délais.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-xl bg-[#4A7C59] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#3d6849] cursor-pointer"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* Sujet */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#1C2B1E]">
          Quel est le sujet de votre demande ?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CONTACT_TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(t.id)}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition-all cursor-pointer ${
                topic === t.id
                  ? "border-[#4A7C59] bg-[#F0F4EF] text-[#2E5C3A]"
                  : "border-[#E2EBE3] bg-white text-[#7A8F7D] hover:bg-[#FAFBF9]"
              }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-xs font-bold text-[#1C2B1E]">
          Votre adresse email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre.email@exemple.com"
          className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 text-xs text-[#1C2B1E] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#4A7C59]"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-xs font-bold text-[#1C2B1E]">
          Votre message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre problème ou partagez votre suggestion en détail..."
          className="w-full rounded-xl border border-[#E2EBE3] bg-white px-3.5 py-2.5 text-xs text-[#1C2B1E] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#4A7C59]"
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={mailtoHref}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#7A8F7D] hover:text-[#2E5C3A]"
        >
          <MailIcon size={14} />
          <span>Ouvrir dans mon client email</span>
          <ExternalLinkIcon size={12} />
        </a>

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#4A7C59] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#3d6849] disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <SpinnerIcon size={14} />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <span>Envoyer le message</span>
          )}
        </button>
      </div>
    </form>
  );
}
