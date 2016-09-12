/** Class for a Bot Thread configuration */
class Thread {

  constructor (apiUrl, request) {
    this.apiURl = apiUrl
    this.request = request
  }

  setGreetingText (text, cb) {
    if (typeof text === 'string') {
      text = {text: text}
    }
    const params = {
      setting_type: 'greeting',
      greeting: text
    }
    this.sendRequest('POST', params, cb)
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
    this.sendRequest('POST', params, cb)
  }

  setPersistentMenu (menuItems, cb) {
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions: menuItems
    }
    this.sendRequest('POST', params, cb)
  }

  deleteGetStartedButton (type, cb) {
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
    }
    this.sendRequest('DELETE', params, cb)
  }

  deletePersistentMenu (type, cb) {
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
    }
    this.sendRequest('DELETE', params, cb)
  }

  sendRequest (method, params, cb) {
    const req = {
      url: `${this.apiUrl}me/thread_settings`,
      qs: {
        access_token: this.token
      },
      method: method,
      json: params
    }
    this.request(req, cb)
  }
}

export default Thread
