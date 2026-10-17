import { sdk } from '../sdk'
import { setAppUrl } from './setAppUrl'
import { toggleRegistration } from './toggleRegistration'
import { setOutgoingMail } from './setOutgoingMail'

export const actions = sdk.Actions.of()
  .addAction(setAppUrl)
  .addAction(toggleRegistration)
  .addAction(setOutgoingMail)
