import request from 'request'
import {EventEmitter} from 'events'

const _apiUrl = 'https://graph.facebook.com/v2.6/'
const _notificationTypes = ['REGULAR', 'SILENT_PUSH', 'NO_PUSH']  // supported types by fb
const _notificationDefault = 'REGULAR'

/** Class representing a Facebook Messenger App. */
class Messenger extends EventEmitter {

  constructor (token = null, options = {}) {
    super()
    if (!token) throw new Error('Facebook Page access token is missing.')  // case bad token
    if (_notificationTypes.indexOf(options.notificationType) === -1) {  // case bad notification type
      options.notificationType = _notificationDefault
    }
    this.token = token
    this.notificationType = options.notificationType
    this.apiUrl = options.apiUrl || _apiUrl
  }

  subscribeApp (cb) {
    const req = {
      url: `${this.apiUrl}me/subscribed_apps`,
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: true
    }
    sendRequest(req, cb)
  }

  sendApiMessage (recipient, message, notificationType, cb) {
    if (typeof notificationType === 'function') {  // case 3rd arg is a func, no notification type was entered but a cb
      cb = notificationType
      notificationType = this.notificationType
    }
    if (!notificationType) {  // case no notification type is entered
      notificationType = this.notificationType
    }
    const req = {
      url: `${this.apiUrl}me/messages`,
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipient
        },
        message: message,
        notification_type: notificationType
      }
    }
    sendRequest(req, cb)
  }

  sendSenderAction (recipient, senderAction, cb) {
    const req = {
      url: `${this.apiUrl}me/messages`,
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipient
        },
        sender_action: senderAction
      }
    }
    sendRequest(req, cb)
  }

  setGreetingText (text, cb) {
    if (typeof text === 'string') {
      text = {text: text}
    }
    const method = 'POST'
    const params = {
      setting_type: 'greeting',
      greeting: text
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  setGetStartedButton (payload, cb) {
    if (typeof payload === 'string') {  // Case a string is entered
      payload = [{
        payload: payload
      }]
    }
    const method = 'POST'
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
      call_to_actions: payload // max 1
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  setPersistentMenu (menuItems, cb) {
    const method = 'POST'
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions: menuItems
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  deleteThreadSetting (threadType, cb) {
    const method = 'DELETE'
    const params = {
      setting_type: 'call_to_actions',
      thread_state: threadType  // Get started button('new_thread') or Persistent menu('existing_thread')
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  sendThreadSettingsRequest (method, params, cb) {
    const req = {
      url: `${this.apiUrl}me/thread_settings`,
      qs: {
        access_token: this.token
      },
      method: method,
      json: params
    }
    sendRequest(req, cb)
  }

  getUserPsid (token, cb) {
    const req = {
      url: `${this.apiUrl}me`,
      qs: {
        access_token: this.token,
        fields: 'recipient',
        account_linking_token: token
      },
      method: 'GET',
      json: true
    }
    sendRequest(req, cb)
  }

  unlinkAccount (psid, cb) {
    const req = {
      url: `${this.apiUrl}me/unlink_accounts`,
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: {
        psid: psid
      }
    }
    sendRequest(req, cb)
  }

  getUserProfile (userId, cb) {
    const req = {
      url: `${this.apiUrl}${userId}`,
      qs: {
        access_token: this.token,
        fields: 'first_name,last_name,profile_pic,locale,timezone,gender'
      },
      method: 'GET',
      json: true
    }
    sendRequest(req, cb)
  }

  _handleCallback (res, data) {
    if (data.object !== 'page') { // check that it's a page subscription
      data.entry.forEach(entry => { // iterate over {array} entry
        console.log(`Callback received from page ${entry.id} at ${entry.time}`)
        entry.messaging.forEach(event => {
          switch (event) {  // switch by callback type
            case (event.message && event.message.is_echo):
              this._handleEvent('echoMessage', event)
              break
            case (event.message && event.message.quick_reply):
              this._handleEvent('quickReply', event)
              break
            case (event.message && event.message.text):
              this._handleEvent('message', event)
              break
            case (event.message && event.message.attachments):
              event.message.attachments.forEach(attachment => {
                this._handleEvent(attachment.type, event) // image, audio, video, file or location
              })
              break
            case (event.optin):
              this._handleEvent('authentication', event)
              break
            case (event.delivery):
              this._handleEvent('delivery', event)
              break
            case (event.postback):
              this._handleEvent('postback', event)
              break
            case (event.read):
              this._handleEvent('read', event)
              break
            case (event.account_linking && event.account_linking.status === 'linked'):
              this._handleEvent('accountLinked', event)
              break
            case (event.account_linking && event.account_linking.status === 'unlinked'):
              this._handleEvent('accountLinked', event)
              break
            default:
              console.error('Webhook received an unknown messaging event: ', JSON.stringify(event))
          }
        })
      })
      // Send back a 200, within 20 seconds, to let FB know that the bot has successfully received the callback.
      // Otherwise, the request will time out.
      res.sendStatus(200)
    } else {
      console.error(`Wrong callback object param: must be 'page' instead of ${data.object}`)
    }
  }

  _handleEvent (type, event) {
    this.emit(type, event, this.sendApiMessage.bind(this, event.sender.id))
  }
}

const sendRequest = (req, cb) => {
  request(req, (error, response, body) => {
    if (!cb) return
    if (error) return cb(error)
    if (response.body.error) return cb(response.body.error)
    cb(null, response.body)
  })
}

export default Messenger
