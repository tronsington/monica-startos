export const DEFAULT_LANG = 'en_US'

const dict = {
  // actions/toggleRegistration.ts
  'Allow new registrations': 0,
  // actions/setAppUrl.ts
  'App Address/URL': 1,
  // init/seedFiles.ts
  'Choose the address Monica serves its web app on': 2,
  // actions/setAppUrl.ts
  'Choose the address Monica serves on.': 3,
  // actions/setOutgoingMail.ts
  'Connect an SMTP server so Monica can send email reminders and confirmation mails. Optional — the app works without it (reminders then only appear inside the app).': 4,
  Encryption: 5,
  'From Address': 6,
  'From Name': 7,
  'Hostname of your mail server. Leave empty to disable outgoing mail entirely.': 8,
  'Leave empty if your server accepts relay without auth.': 9,
  // actions/toggleRegistration.ts
  'Leave on only until your account exists — Monica is built as a single-tenant app, so the first account is usually the only one you need. Turn off once you have signed up.': 10,
  // main.ts
  'MariaDB is ready': 11,
  // actions/setAppUrl.ts
  'Monica builds absolute links (reminder emails, exports) from this address. Changing it later invalidates links it already generated. Choose the address you intend to keep.': 12,
  // main.ts
  'Monica is not ready': 13,
  'Monica is ready': 14,
  // interfaces.ts
  'Monica personal CRM web app': 15,
  Monica: 16,
  // actions/setAppUrl.ts
  'No domain is switched on for the Monica interface yet. Add one under Interfaces and switch it on there first.': 17,
  // actions/setOutgoingMail.ts
  None: 18,
  // actions/toggleRegistration.ts
  'Open or close new account registration.': 19,
  // actions/setOutgoingMail.ts
  'Outgoing Mail': 20,
  // main.ts
  'Queue worker is not running': 21,
  'Queue worker is running': 22,
  // actions/setOutgoingMail.ts
  'Re-opens blank: submit empty to keep the stored password.': 23,
  // actions/toggleRegistration.ts
  Registration: 24,
  // actions/setOutgoingMail.ts
  'SMTP Host': 25,
  'SMTP Password': 26,
  'SMTP Port': 27,
  'SMTP Username': 28,
  'STARTTLS (tls) is the common choice.': 29,
  // main.ts
  'Scheduler is not running': 30,
  'Scheduler is running': 31,
  // actions/setAppUrl.ts
  'Set App Address': 32,
  // main.ts
  'Starting Monica': 33,
  'Waiting for MariaDB to be ready': 34,
  // actions/setOutgoingMail.ts
  'The address reminder emails are sent from.': 35,
  // actions/setAppUrl.ts
  'The address your browser will use to reach Monica. Links Monica generates (reminder emails, export URLs) point here; changing it later invalidates them.': 36,
  // actions/setOutgoingMail.ts
  'The display name on outgoing mail.': 37,
  'Usually 587 (submission/starttls), 465 (ssl) or 25 (plain relay).': 38,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
