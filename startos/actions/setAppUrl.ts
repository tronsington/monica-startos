import { getMonicaAppUrls } from '../interfaces'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const urls = await getMonicaAppUrls(effects)
    return {
      name: i18n('App Address/URL'),
      description: urls.length
        ? i18n(
            'The address your browser will use to reach Monica. Links Monica generates (reminder emails, export URLs) point here; changing it later invalidates them.',
          )
        : i18n(
            'No domain is switched on for the Monica interface yet. Add one under Interfaces and switch it on there first.',
          ),
      warning: null,
      values: urls.reduce(
        (obj: Record<string, string>, url: string) => ({ ...obj, [url]: url }),
        {},
      ),
      default: null,
    }
  }),
})

export const setAppUrl = sdk.Action.withInput(
  'set-app-url',
  async () => ({
    name: i18n('Set App Address'),
    description: i18n('Choose the address Monica serves on.'),
    warning: i18n(
      'Monica builds absolute links (reminder emails, exports) from this address. Changing it later invalidates links it already generated. Choose the address you intend to keep.',
    ),
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'hidden',
  }),
  inputSpec,
  async () => ({}),
  async ({ effects, input }) => {
    await storeJson.merge(effects, { appUrl: input.url })
  },
)
