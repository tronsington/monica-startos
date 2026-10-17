import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  signupsEnabled: Value.toggle({
    name: i18n('Allow new registrations'),
    description: i18n(
      'Leave on only until your account exists — Monica is built as a single-tenant app, so the first account is usually the only one you need. Turn off once you have signed up.',
    ),
    default: false as boolean,
  }),
})

// APP_DISABLE_SIGNUP (inverted) is fed from this at every start; verified
// against RegisterController at the pinned tag — when set, only non-first
// signups are blocked, so the very first account can always be created.
export const toggleRegistration = sdk.Action.withInput(
  'toggle-registration',
  async () => ({
    name: i18n('Registration'),
    description: i18n('Open or close new account registration.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const store = await storeJson.read((s) => s.signupsEnabled).once()
    return {
      signupsEnabled: store ?? false,
    }
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      signupsEnabled: Boolean(input.signupsEnabled),
    })
  },
)
