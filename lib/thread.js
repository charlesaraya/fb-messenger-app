let _token = new WeakMap()
let _apiUrl = new WeakMap()
let _request = new WeakMap()

/** Class for a Bot Thread configuration */
class Thread {

  constructor (token, apiUrl, request) {
    _token.set(this, token)
    _apiUrl.set(this, apiUrl)
    _request.set(this, request)
  }

  setGreetingText (text, cb) {
    if (typeof text === 'string') {
      text = {text: text}
    }
    const params = {
      setting_type: 'greeting',
      greeting: text
    }
    this.sendSettingRequest('POST', params, cb)
  }

  setGetStartedButton (payload, cb) {
    if (typeof payload === 'string') {  // Case a string is entered
      payload = [{
        payload: payload
      }]
    }
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
      call_to_actions: payload // max 1
    }
    this.sendSettingRequest('POST', params, cb)
  }

  setPersistentMenu (menuItems, cb) {
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions: menuItems
    }
    this.sendSettingRequest('POST', params, cb)
  }

  deleteGetStartedButton (cb) {
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread'
    }
    this.sendSettingRequest('DELETE', params, cb)
  }

  deletePersistentMenu (cb) {
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread'
    }
    this.sendSettingRequest('DELETE', params, cb)
  }

  sendSettingRequest (method, params, cb) {
    const req = {
      url: `${_apiUrl.get(this)}me/thread_settings`,
      qs: {
        access_token: _token.get(this)
      },
      method: method,
      json: params
    }
    _request.get(this)(req, cb)
  }
}

export default Thread
