let _token = new WeakMap()
let _apiUrl = new WeakMap()
let _request = new WeakMap()

/** Class for a Bot Thread configuration */
class SenderAction {

  constructor (token, apiUrl, request) {
    _token.set(this, token)
    _apiUrl.set(this, apiUrl)
    _request.set(this, request)
  }

  sendMarkSeenInterval (recipient, time, cb) {
    return new Promise(resolve => setTimeout(() => {
      this.sendSenderActionRequest(recipient, 'mark_seen', cb)
      resolve()
    }, time))
  }

  sendTypingInterval (recipient, time, cb) {
    this.sendSenderActionRequest(recipient, 'typing_on', cb)
    return new Promise(resolve => setTimeout(() => {
      this.sendSenderActionRequest(recipient, 'typing_off', cb)
      resolve()
    }, time))
  }

  sendSenderActionRequest (recipient, senderAction, cb) {
    const req = {
      url: `${_apiUrl.get(this)}me/messages`,
      qs: {
        access_token: _token.get(this)
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipient
        },
        sender_action: senderAction
      }
    }
    _request.get(this)(req, cb)
  }
}

export default SenderAction
