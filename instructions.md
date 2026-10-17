# Monica on StartOS

Monica is an open-source personal CRM: contacts, relationships, notes,
reminders, activities and a journal for the people in your life — with
CalDAV/CardDAV sync for your devices.

## First start

1. Answer the **Set App Address** task (the address your browser will use —
   reminder emails and exports link back to it, so pick the one you intend
   to keep).
2. Start the service and **wait** — first boot runs the full database
   migration set before the login page serves. Cold installs can take a
   couple of minutes; health goes green when the app is actually up.
3. Register your account immediately. Registrations ship **open**; Monica is
   built single-tenant, so the first account is normally the only one you
   need — then use the **Registration** action to close signups.
4. (Optional) Reminder **emails** need an SMTP server: set one under
   **Outgoing Mail**. Without it, reminders still fire inside the app — and
   the in-app reminder feed works regardless — but nothing is emailed.

## Notes

- **CardDAV/CalDAV** endpoints live under `<your Monica address>/dav` and
  are enabled by default; use your Monica credentials with a DAV-capable
  contacts/calendar app.
- Uploads, avatars and generated files live in the package's `storage`
  volume; the database backs up as a logical dump, so restores survive
  MariaDB upgrades.
- The reminder scheduler and the background job worker run as separate
  daemons inside the package; on a cold first boot they may restart a few
  times while migrations finish, then settle for good.
- Double-opt-in email confirmation for signups is off by default (it needs
  outgoing mail to be useful at all).
