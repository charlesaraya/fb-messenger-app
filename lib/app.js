import request from 'request'
import {EventEmitter} from 'events'
import Thread from './thread'
import SenderAction from './sender-action'
import * as verify from './verify'

const _apiUrl_ = 'https://graph.facebook.com/v2.6/'
const _supportedNotificationTypes = ['REGULAR', 'SILENT_PUSH', 'NO_PUSH']  // supported types by fb
const _notificationDefault = 'REGULAR'

let _token = new WeakMap()
let _notificationType = new WeakMap()
let _apiUrl = new WeakMap()

/** Class representing a Facebook Messenger App. */
class Messenger extends EventEmitter {

  constructor (token = null, options = {}) {
    super()
    if (!token) throw new Error('Facebook Page access token is missing.')  // case bad token
    if (_supportedNotificationTypes.indexOf(options.notificationType) === -1) {  // case bad notification type
      options.notificationType = _notificationDefault
    }
    _token.set(this, token)
    _notificationType.set(this, options.notificationType)
    _apiUrl.set(this, options.apiUrl || _apiUrl_)

    this.threadSetting = new Thread(_token.get(this), _apiUrl.get(this), sendRequest)
    this.senderAction = new SenderAction(_token.get(this), _apiUrl.get(this), sendRequest)
    this.verify = verify
  }

  getToken () {
    return _token.get(this)
  }

  getApiUrl () {
    return _apiUrl.get(this)
  }

  getNotificationType () {
    return _notificationType.get(this)
  }

  sendApiMessage (recipient, message, notificationType, cb) {
    if (typeof notificationType === 'function') {  // case 3rd arg is a func, no notification type was entered but a cb
      cb = notificationType
      notificationType = _notificationType.get(this)
    }
    if (!notificationType) {  // case no notification type is entered
      notificationType = _notificationType.get(this)
    }
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
        message: message,
        notification_type: notificationType
      }
    }
    sendRequest(req, cb)
  }

  subscribeApp (cb) {
    const req = {
      url: `${_apiUrl.get(this)}me/subscribed_apps`,
      qs: {
        access_token: _token.get(this)
      },
      method: 'POST',
      json: true
    }
    sendRequest(req, cb)
  }

  getUserPsid (token, cb) {
    const req = {
      url: `${_apiUrl.get(this)}me`,
      qs: {
        access_token: _token.get(this),
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
      url: `${_apiUrl.get(this)}me/unlink_accounts`,
      qs: {
        access_token: _token.get(this)
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
      url: `${_apiUrl.get(this)}${userId}`,
      qs: {
        access_token: _token.get(this),
        fields: 'first_name,last_name,profile_pic,locale,timezone,gender'
      },
      method: 'GET',
      json: true
    }
    sendRequest(req, cb)
  }

  _handleCallback (res, data) {
    if (data.object === 'page') { // check that it's a page subscription
      data.entry.forEach(entry => { // iterate over {array} entry
        console.log(`Callback received from page ${entry.id} at ${entry.time}`)

        entry.messaging.forEach(event => {
          if (event.message && event.message.is_echo) {
            this._handleEvent('echoMessage', event)
          } else if (event.message && event.message.quick_reply) {
            this._handleEvent('quickReply', event)
          } else if (event.message && event.message.text) {
            this._handleEvent('message', event)
          } else if (event.message && event.message.attachments) {
            event.message.attachments.forEach(attachment => {
              this._handleEvent(attachment.type, event) // image, audio, video, file or location
            })
          } else if (event.optin) {
            this._handleEvent('authentication', event)
          } else if (event.delivery) {
            this._handleEvent('delivery', event)
          } else if (event.postback) {
            this._handleEvent('postback', event)
          } else if (event.read) {
            this._handleEvent('read', event)
          } else if (event.account_linking && event.account_linking.status === 'linked') {
            this._handleEvent('accountLinked', event)
          } else if (event.account_linking && event.account_linking.status === 'unlinked') {
            this._handleEvent('accountUnlinked', event)
          } else {
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
