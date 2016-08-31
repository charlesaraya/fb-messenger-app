import request from 'request'

const apiUrl = 'https://graph.facebook.com/v2.6/'

/** Class representing a Facebook Messenger App. */
class Messenger {
  /**
   * Create a Messenger.
   *
   * @param {string} [token=null] - The Facebook Page Access Token.
   * @param {string} [notificationType=REGULAR] - The default message notification type.
   */
  constructor (token = null, notificationType = 'REGULAR') {
    this.token = token
    this.notificationType = notificationType

    if (!this.token) throw new Error('Facebook Page access token is missing.')
  }

  /**
  * This method will subscribe App via API
  *
  * @callback [cb] - The callback function
  */
  subscribeApp (cb) {
    const req = {
      url: `${apiUrl}me/subscribed_apps`,
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: true
    }
    sendRequest(req, cb)
  }

  /**
  * This method will send a plain Text Message.
  *
  * @param {string} recipient - The user id that will receive the message
  * @param {string} text - The text message (required)
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendTextMessage (recipient, text, notificationType, cb) {
    const message = { text: message }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send a Quick Replies Message.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {object[]} quickReplies - The quick replies to be sent with messages
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendQuickMessage (recipient, quickReplies, notificationType, cb) {
    const message = { quick_replies: quickReplies }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send an Attachment Message.
  *
  * @param {string} recipient - The user id that will receive the message
  * @param {string} type - The attachment type [image, audio, video, file, location, template]
  * @param {object} payload - The attachment payload
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendAttachmentMessage (recipient, type, payload, notificationType, cb) {
    const message = {
      attachment: {
        type: type,
        payload: payload
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send a file attachment. The file type must be image, audio, video or file).
  * Image supported formats [jpg, png and gifs]
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {string} type - The file type ['image', 'audio', 'video' or 'file']
  * @param {string} fileUrl - The file url where it is hosted (required)
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendFileMessage (recipient, type, fileUrl, notificationType, cb) {
    const payload = { url: fileUrl }
    this.sendAttachmentMessage(recipient, type, payload, notificationType, cb)
  }

  /**
  * This method will send a text and buttons attachment to request input from the user.
  * The buttons can open a URL, or make a back-end call to your webhook.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {string} text - The head text of the button message
  * @param {object[]} buttons - The Set of call-to-action buttons
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendButtonMessage (recipient, text, buttons, notificationType, cb) {
    const message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: text,
          buttons: buttons
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send a Structured Generic Message, to send a horizontal scrollable carousel of items,
  * each composed of an image attachment, short description and buttons to request input from the user.
  * The buttons can open a URL, or make a back-end call to your webhook.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {object[]} elements - The Data for each bubble in message
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendGenericMessage (recipient, elements, notificationType, cb) {
    const message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send a Receipt Message, to send a order confirmation,
  * with the transaction summary and description for each item.
  *
  * @param {string} recipient - The receipient user id.
  * @param {object} receipt - The Receipt Template
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendReceiptMessage (recipient, receipt, notificationType, cb) {
    const message = {
      attachment: {
        type: 'template',
        payload: receipt
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send an Airplane Itinerary Message, that contains the itinerary and receipt.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {object} itinerary - The payload of itinerary template (required)
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendItineraryMessage (recipient, itinerary, notificationType, cb) {
    const message = {
      attachment: {
        type: 'template',
        payload: itinerary
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send an Airplane Check-In Reminder Message.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {object} checkin - The payload of checkin template (required)
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendCheckinMessage (recipient, checkin, notificationType, cb) {
    const message = {
      attachment: {
        type: 'template',
        payload: checkin
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send an Airplane Boarding Pass Message, that contains boarding
  * passes for one or more flights or one more passengers
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {object} boardingpass - The payload of boarding pass template (required)
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendBoardingpassMessage (recipient, boardingpass, notificationType, cb) {
    const message = {
      attachment: {
        type: 'template',
        payload: boardingpass
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send an Airplane Flight Update Message.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {object} flightupdate - The payload of flight update template (required)
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendFlightupdateMessage (recipient, flightupdate, notificationType, cb) {
    const message = {
      attachment: {
        type: 'template',
        payload: flightupdate
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /**
  * This method will send a message to the user.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {object} message - The message object (required)
  * @param {string} [notificationType] - The notification type
  * @callback [cb] - The callback function
  */
  sendApiMessage (recipient, message, notificationType, cb) {
    if (typeof notificationType === 'function') {
      cb = notificationType
      notificationType = this.notificationType
    }
    const req = {
      url: `${apiUrl}me/messages`,
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

  /**
  * This method will send Sender Actions, this are typing indicators or send read receipts,
  * to let the user know you are processing their request
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {string} senderAction - The action typing indicator (required)
  * @callback [cb] - The callback function
  */
  sendSenderAction (recipient, senderAction, cb) {
    const req = {
      url: `${apiUrl}me/messages`,
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

  /**
  * This method will set a Greeting Text.
  *
  * @param {(object|string)} text - The greeting text
  * @callback [cb] - The callback function
  */
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

  /**
  * This method will set a Get Started Button, in the welcome screen.
  *
  * @param {(object[]|string)} payload - The string payloads
  * @callback [cb] - The callback function
  */
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

  /**
  * This method will set a Persistent Menu, always available to the user.
  *
  * @param {object[]} menuItems - The menu items in the menu
  * @callback [cb] - The callback function
  */
  setPersistentMenu (menuItems, cb) {
    const method = 'POST'
    const params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions: menuItems
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  /**
  * This method will delete a Thread Setting. Get Started Button('new_thread')
  * or Persistent Menu('existing_thread')
  *
  * @param {string} threadType - The thread type to be deleted
  * @callback [cb] - The callback function
  */
  deleteThreadSetting (threadType, cb) {
    const method = 'DELETE'
    const params = {
      setting_type: 'call_to_actions',
      thread_state: threadType
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  /**
  * This method will Configure the Thread Setting on Messenger.
  *
  * @param {string} method - The call request (POST or DELETE)
  * @param {object} params - The configuration parameters
  * @callback [cb] - The callback function
  */
  sendThreadSettingsRequest (method, params, cb) {
    const req = {
      url: `${apiUrl}me/thread_settings`,
      qs: {
        access_token: this.token
      },
      method: method,
      json: params
    }
    sendRequest(req, cb)
  }

  /**
  * This method will send an account linking call-2-action to the user.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {string} title - The title of the account linking CTA
  * @param {string} imageUrl - The URL of the image in the account linking CTA
  * @param {string} authUrl - The Authentication callback URL
  * @callback [cb] - The callback function
  */
  sendAccountLinkingMessage (recipient, title, imageUrl, authUrl, cb) {
    const message = {
      attachment: {
        type: 'tempalte',
        payload: {
          template_type: 'generic',
          elements: [{
            title: title,
            image_url: imageUrl,
            buttons: [{
              type: 'account_link',
              url: authUrl
            }]
          }]
        }
      }
    }
    this.sendApiMessage(recipient, message, cb)
  }

  /**
  * This method will retrieve the user page-scoped ID (PSID) using the account
  * linking endpoint.
  *
  * @param {string} token - The account linking token
  * @callback [cb] - The callback function
  */
  getUserPsid (token, cb) {
    const req = {
      url: `${apiUrl}me`,
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

  /**
  * This method will send an account unlinking call-2-action to the user.
  *
  * @param {string} recipient - The user id to whom we're sending the text message
  * @param {string} title - The title of the account linking CTA
  * @param {string} imageUrl - The URL of the image in the account linking CTA
  * @callback [cb] - The callback function
  */
  sendAccountUnlinkingMessage (recipient, title, imageUrl, cb) {
    const message = {
      attachment: {
        type: 'tempalte',
        payload: {
          template_type: 'generic',
          elements: [{
            title: title,
            image_url: imageUrl,
            buttons: [{
              type: 'account_unlink'
            }]
          }]
        }
      }
    }
    this.sendApiMessage(recipient, message, cb)
  }

  /**
  * This method will unlink the user account.
  *
  * @param {string} psid - A valid page-scoped ID (PSID)
  * @callback [cb] - The callback function
  */
  unlinkAccount (psid, cb) {
    const req = {
      url: `${apiUrl}me/unlink_accounts`,
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

  /**
  * This method will get the User Profile, used to query more information about
  * the user, and personalize the experience further.
  *
  * @param {string} userId - The user id
  * @callback [cb] - The callback function
  */
  getUserProfile (userId, cb) {
    const req = {
      url: `${apiUrl}${userId}`,
      qs: {
        access_token: this.token,
        fields: 'first_name,last_name,profile_pic,locale,timezone,gender'
      },
      method: 'GET',
      json: true
    }
    sendRequest(req, cb)
  }
}

/**
* This method will send a Request to the Send API.
*
* @param {object} req - The request being send
* @callback [cb] - The callback function
*/
const sendRequest = (req, cb) => {
  request(req, (error, response, body) => {
    if (!cb) return
    if (error) return cb(error)
    if (response.body.error) return cb(response.body.error)
    cb(null, response.body)
  })
}

export default Messenger
