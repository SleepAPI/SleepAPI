import type { PiniaPluginContext } from 'pinia'
import { DOMAIN_VERSION } from 'sleepapi-common'

const domainVersionPlugin = (context: PiniaPluginContext) => {
  const { store } = context

  const cachedVersion = store.domainVersion

  if (cachedVersion && +cachedVersion !== DOMAIN_VERSION) {
    if (typeof store.outdate === 'function') {
      store.outdate()
    }
  }
}

export default domainVersionPlugin
