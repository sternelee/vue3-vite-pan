import { getStore } from '@/plugins/vuex-store-plugin'

export function stat (category, action, data) {
  if (process.env.NODE_ENV === 'development') {
    console.log(category, action, data)
  }

  const store = getStore()
  const userid = store.state.user.curUser.userId || ''
  const target = store.state.user.userInfo.target || ''
  let isVip = false
  if (store.state.user.curUser.vipData) {
    isVip = store.state.user.curUser.vipData.isVip || false
  }

  const extraData = {
    clientType: 'pc',
    businessType: 'remote_control',
    cooperid: 'qunhui',
    userid,
    peerid: target,
    guid: '', 
    cookid: '',
    vip_type: isVip,
    ...data
  }

  xla2.push({
    type: 'event',
    category: category || 'page_event',
    action,
    extdata: extraData
  })
}

export function addExtData (data) {
  xla2.push({
    type: 'globalExtData',
    data
  })
}
