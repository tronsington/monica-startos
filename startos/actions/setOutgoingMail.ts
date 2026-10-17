import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

// Mirrors upstream's MAIL_* env surface (.env.example at the pinned tag).
// Empty host = mail off: main.ts then sets MAIL_MAILER=log so reminders
// degrade to log lines instead of SMTP errors.
const inputSpec = InputSpec.of({
  host: Value.text({
    name: i18n('SMTP Host'),
    description: i18n(
      'Hostname of your mail server. Leave empty to disable outgoing mail entirely.',
    ),
    required: false,
    default: null,
    masked: false,
    placeholder: 'smtp.example.com',
  }),
  port: Value.number({
    name: i18n('SMTP Port'),
    description: i18n(
      'Usually 587 (submission/starttls), 465 (ssl) or 25 (plain relay).',
    ),
    required: false,
    default: 587,
    min: 1,
    max: 65535,
    integer: true,
    placeholder: '587',
  }),
  username: Value.text({
    name: i18n('SMTP Username'),
    description: i18n('Leave empty if your server accepts relay without auth.'),
    required: false,
    default: null,
    masked: false,
    placeholder: null,
  }),
  password: Value.text({
    name: i18n('SMTP Password'),
    description: i18n(
      'Re-opens blank: submit empty to keep the stored password.',
    ),
    required: false,
    default: null,
    masked: true,
    placeholder: null,
  }),
  encryption: Value.select({
    name: i18n('Encryption'),
    description: i18n('STARTTLS (tls) is the common choice.'),
    values: {
      tls: 'STARTTLS',
      ssl: 'SSL',
      '': i18n('None'),
    },
    default: 'tls',
  }),
  fromAddress: Value.text({
    name: i18n('From Address'),
    description: i18n('The address reminder emails are sent from.'),
    required: false,
    default: null,
    masked: false,
    placeholder: 'monica@example.com',
  }),
  fromName: Value.text({
    name: i18n('From Name'),
    description: i18n('The display name on outgoing mail.'),
    required: false,
    default: 'Monica instance',
    masked: false,
    placeholder: null,
  }),
})

export const setOutgoingMail = sdk.Action.withInput(
  'set-outgoing-mail',
  async () => ({
    name: i18n('Outgoing Mail'),
    description: i18n(
      'Connect an SMTP server so Monica can send email reminders and confirmation mails. Optional — the app works without it (reminders then only appear inside the app).',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const current = await storeJson.read((s) => s).once()
    return {
      host: current?.mailHost ?? '',
      port: Number(current?.mailPort) || 587,
      username: current?.mailUsername ?? '',
      password: '',
      encryption: (['tls', 'ssl', ''].includes(current?.mailEncryption ?? '')
        ? current!.mailEncryption
        : 'tls') as 'tls' | 'ssl' | '',
      fromAddress: current?.mailFromAddress ?? '',
      fromName: current?.mailFromName ?? 'Monica instance',
    }
  },
  async ({ effects, input }) => {
    // Masked password re-opens blank; empty submit keeps the stored one
    // (same contract as outline's OIDC secret).
    const keepPassword = !input.password
    await storeJson.merge(effects, {
      mailHost: (input.host ?? '').trim(),
      mailPort: String(input.port ?? 587),
      mailUsername: input.username ?? '',
      ...(keepPassword ? {} : { mailPassword: input.password || '' }),
      mailEncryption: input.encryption ?? '',
      mailFromAddress: input.fromAddress ?? '',
      mailFromName: input.fromName || 'Monica instance',
    })
  },
)
