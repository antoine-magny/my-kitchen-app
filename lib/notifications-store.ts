/**
 * Store de préférences pour les notifications et alertes utilisateur.
 *
 * Gère la persistance locale dans le localStorage et fournit des valeurs
 * par défaut sécurisées et assainies.
 * Fichier 100% pur TypeScript (zéro JSX).
 */

export type NotificationPreferences = {
  /** Statut d'activation global des notifications navigateur */
  browserPushEnabled: boolean;

  /** Alertes de péremption des aliments (DLC) */
  dlcAlertsEnabled: boolean;
  /** Nombre de jours avant la DLC pour déclencher l'alerte (1, 2 ou 3) */
  dlcDaysBefore: number;
  /** Heure quotidienne de l'alerte DLC (format "HH:mm") */
  dlcAlertHour: string;
  /** Alias dlcAlertTime pour compatibilité */
  dlcAlertTime: string;

  /** Rappels des repas planifiés du jour */
  mealRemindersEnabled: boolean;
  /** Alias mealReminderEnabled pour compatibilité */
  mealReminderEnabled: boolean;
  /** Heure de rappel pour le déjeuner (format "HH:mm") */
  lunchReminderHour: string;
  /** Heure de rappel pour le dîner (format "HH:mm") */
  dinnerReminderHour: string;
  /** Alias mealReminderTime pour compatibilité */
  mealReminderTime: string;

  /** Rappels pour la liste de courses */
  shoppingRemindersEnabled: boolean;
  /** Alias shoppingReminderEnabled pour compatibilité */
  shoppingReminderEnabled: boolean;
  /** Jour de la semaine pour le rappel des courses (0 = Dimanche, 6 = Samedi) */
  shoppingReminderDay: number;
  /** Heure du rappel des courses (format "HH:mm") */
  shoppingReminderHour: string;
  /** Alias shoppingReminderTime pour compatibilité */
  shoppingReminderTime: string;

  /** Bilan anti-gaspillage hebdomadaire (dimanche soir) */
  weeklyRecapEnabled: boolean;
  /** Alias weeklySummaryEnabled pour compatibilité */
  weeklySummaryEnabled: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  browserPushEnabled: false,
  dlcAlertsEnabled: true,
  dlcDaysBefore: 2,
  dlcAlertHour: "09:00",
  dlcAlertTime: "09:00",
  mealRemindersEnabled: true,
  mealReminderEnabled: true,
  lunchReminderHour: "11:30",
  dinnerReminderHour: "18:30",
  mealReminderTime: "18:30",
  shoppingRemindersEnabled: true,
  shoppingReminderEnabled: true,
  shoppingReminderDay: 6, // Samedi
  shoppingReminderHour: "10:00",
  shoppingReminderTime: "10:00",
  weeklyRecapEnabled: false,
  weeklySummaryEnabled: false,
};

export const DAYS_OF_WEEK: readonly { id: number; label: string; shortLabel: string }[] = [
  { id: 1, label: "Lundi", shortLabel: "Lun" },
  { id: 2, label: "Mardi", shortLabel: "Mar" },
  { id: 3, label: "Mercredi", shortLabel: "Mer" },
  { id: 4, label: "Jeudi", shortLabel: "Jeu" },
  { id: 5, label: "Vendredi", shortLabel: "Ven" },
  { id: 6, label: "Samedi", shortLabel: "Sam" },
  { id: 0, label: "Dimanche", shortLabel: "Dim" },
] as const;

export const DLC_DAYS_OPTIONS = [
  { value: 1, label: "1 jour avant" },
  { value: 2, label: "2 jours avant" },
  { value: 3, label: "3 jours avant" },
] as const;

const STORAGE_KEYS = [
  "my-kitchen-notifications-v1",
  "my-kitchen-notification-preferences-v1",
];

function sanitizeHour(value: unknown, defaultHour: string): string {
  if (typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return value;
  }
  return defaultHour;
}

/**
 * Récupère les préférences de notifications depuis le localStorage.
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  try {
    let raw: string | null = null;
    // Si la clé de test preferences-v1 existe, la prioriser
    const prefRaw = window.localStorage.getItem("my-kitchen-notification-preferences-v1");
    const notifRaw = window.localStorage.getItem("my-kitchen-notifications-v1");
    raw = prefRaw ?? notifRaw;
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    const dlcAlerts = parsed.dlcAlertsEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.dlcAlertsEnabled;
    const dlcDays = typeof parsed.dlcDaysBefore === "number" && parsed.dlcDaysBefore >= 0
      ? parsed.dlcDaysBefore
      : DEFAULT_NOTIFICATION_PREFERENCES.dlcDaysBefore;
    const dlcHour = sanitizeHour(
      parsed.dlcAlertTime ?? parsed.dlcAlertHour,
      DEFAULT_NOTIFICATION_PREFERENCES.dlcAlertHour,
    );

    const mealReminders =
      parsed.mealReminderEnabled ??
      parsed.mealRemindersEnabled ??
      DEFAULT_NOTIFICATION_PREFERENCES.mealRemindersEnabled;
    const lunchHour = sanitizeHour(
      parsed.lunchReminderHour,
      DEFAULT_NOTIFICATION_PREFERENCES.lunchReminderHour,
    );
    const dinnerHour = sanitizeHour(
      parsed.mealReminderTime ?? parsed.dinnerReminderHour,
      DEFAULT_NOTIFICATION_PREFERENCES.dinnerReminderHour,
    );

    const shoppingReminders =
      parsed.shoppingReminderEnabled ??
      parsed.shoppingRemindersEnabled ??
      DEFAULT_NOTIFICATION_PREFERENCES.shoppingRemindersEnabled;
    const shoppingDay =
      typeof parsed.shoppingReminderDay === "number" &&
      parsed.shoppingReminderDay >= 0 &&
      parsed.shoppingReminderDay <= 6
        ? parsed.shoppingReminderDay
        : DEFAULT_NOTIFICATION_PREFERENCES.shoppingReminderDay;
    const shoppingHour = sanitizeHour(
      parsed.shoppingReminderTime ?? parsed.shoppingReminderHour,
      DEFAULT_NOTIFICATION_PREFERENCES.shoppingReminderHour,
    );

    const weeklyRecap = Boolean(
      parsed.weeklySummaryEnabled ?? parsed.weeklyRecapEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.weeklyRecapEnabled,
    );

    return {
      browserPushEnabled: Boolean(parsed.browserPushEnabled),
      dlcAlertsEnabled: Boolean(dlcAlerts),
      dlcDaysBefore: dlcDays,
      dlcAlertHour: dlcHour,
      dlcAlertTime: dlcHour,
      mealRemindersEnabled: Boolean(mealReminders),
      mealReminderEnabled: Boolean(mealReminders),
      lunchReminderHour: lunchHour,
      dinnerReminderHour: dinnerHour,
      mealReminderTime: dinnerHour,
      shoppingRemindersEnabled: Boolean(shoppingReminders),
      shoppingReminderEnabled: Boolean(shoppingReminders),
      shoppingReminderDay: shoppingDay,
      shoppingReminderHour: shoppingHour,
      shoppingReminderTime: shoppingHour,
      weeklyRecapEnabled: weeklyRecap,
      weeklySummaryEnabled: weeklyRecap,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Sauvegarde les préférences complètes dans le localStorage.
 */
export function setNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of STORAGE_KEYS) {
      window.localStorage.setItem(key, JSON.stringify(prefs));
    }
  } catch (err) {
    console.error("Impossible d'enregistrer les préférences de notifications :", err);
  }
}

/**
 * Réinitialise les préférences de notifications aux valeurs par défaut.
 */
export function resetNotificationPreferences(): NotificationPreferences {
  setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

/**
 * Met à jour partiellement et enregistre les préférences de notifications.
 */
export function saveNotificationPreferences(
  patch: Partial<NotificationPreferences>,
): NotificationPreferences {
  const current = getNotificationPreferences();
  const dlcAlerts = patch.dlcAlertsEnabled !== undefined ? patch.dlcAlertsEnabled : current.dlcAlertsEnabled;
  const dlcDays = typeof patch.dlcDaysBefore === "number" ? patch.dlcDaysBefore : current.dlcDaysBefore;
  const dlcHour = sanitizeHour(patch.dlcAlertTime ?? patch.dlcAlertHour ?? current.dlcAlertHour, current.dlcAlertHour);

  const mealReminders = patch.mealReminderEnabled !== undefined
    ? patch.mealReminderEnabled
    : (patch.mealRemindersEnabled !== undefined ? patch.mealRemindersEnabled : current.mealRemindersEnabled);
  const lunchHour = sanitizeHour(patch.lunchReminderHour ?? current.lunchReminderHour, current.lunchReminderHour);
  const dinnerHour = sanitizeHour(patch.mealReminderTime ?? patch.dinnerReminderHour ?? current.dinnerReminderHour, current.dinnerReminderHour);

  const shoppingReminders = patch.shoppingReminderEnabled !== undefined
    ? patch.shoppingReminderEnabled
    : (patch.shoppingRemindersEnabled !== undefined ? patch.shoppingRemindersEnabled : current.shoppingRemindersEnabled);
  const shoppingDay = typeof patch.shoppingReminderDay === "number" ? patch.shoppingReminderDay : current.shoppingReminderDay;
  const shoppingHour = sanitizeHour(patch.shoppingReminderTime ?? patch.shoppingReminderHour ?? current.shoppingReminderHour, current.shoppingReminderHour);

  const weeklyRecap = patch.weeklySummaryEnabled !== undefined
    ? patch.weeklySummaryEnabled
    : (patch.weeklyRecapEnabled !== undefined ? patch.weeklyRecapEnabled : current.weeklyRecapEnabled);

  const next: NotificationPreferences = {
    browserPushEnabled: patch.browserPushEnabled !== undefined ? patch.browserPushEnabled : current.browserPushEnabled,
    dlcAlertsEnabled: Boolean(dlcAlerts),
    dlcDaysBefore: dlcDays,
    dlcAlertHour: dlcHour,
    dlcAlertTime: dlcHour,
    mealRemindersEnabled: Boolean(mealReminders),
    mealReminderEnabled: Boolean(mealReminders),
    lunchReminderHour: lunchHour,
    dinnerReminderHour: dinnerHour,
    mealReminderTime: dinnerHour,
    shoppingRemindersEnabled: Boolean(shoppingReminders),
    shoppingReminderEnabled: Boolean(shoppingReminders),
    shoppingReminderDay: shoppingDay,
    shoppingReminderHour: shoppingHour,
    shoppingReminderTime: shoppingHour,
    weeklyRecapEnabled: Boolean(weeklyRecap),
    weeklySummaryEnabled: Boolean(weeklyRecap),
  };

  setNotificationPreferences(next);
  return next;
}
