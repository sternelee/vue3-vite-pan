let store = {}

export default function (context, inject) {
  store = context.store
}

export function getStore () {
  return store
}
