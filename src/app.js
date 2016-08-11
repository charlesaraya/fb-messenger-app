import request from 'request'

const apiUrl = 'https://graph.facebook.com/v2.6/'

class Messenger {

  constructor (token, notificationType) {
    this.token = token || null
    this.notificationType = notificationType || 'REGULAR'

    if (!this.token) throw new Error('Facebook Page token is missing')
  }

  /*
   * Subscribe App via API
   *
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

  /*
   * Authorization Event
   *
   */
  receivedAuthentication (event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var timeOfAuth = event.timestamp
    var passThroughParam = event.optin.ref

    console.log(`Authentication received for user ${sender} and page ${recipient} 
      with pass-through param ${passThroughParam} at ${timeOfAuth}`)
  }

  /*
   * Received Message Event
   *
   */
  receivedMessage (event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var timeOfMessage = event.timestamp
    var message = event.message
    var mid = message.mid
    var seq = message.seq

    let isEcho = message.is_echo
    let metadata = message.metadata
    let appId = message.app_id
    let quickReply = message.quick_reply
    let text = message.text
    let attachment = message.attachments

    if (isEcho) {  // When a message has been send by your page
      console.log(`${seq}-${mid}-${timeOfMessage}: Received echo message from app 
        ${appId}, page ${sender} and user ${recipient} with metadata ${metadata}`)
      return
    } else if (quickReply) {
      let quickReplyPayload = quickReply.payload
      console.log(`${seq}-${mid}-${timeOfMessage}: Quick reply received from 
        user ${sender} and page ${recipient} with text ${text} and payload 
        ${quickReplyPayload}`)
      return
    }
    // When a message has been send to your page
    if (text) {
      console.log(`${seq}-${mid}-${timeOfMessage}: Received message from user 
        ${sender} and page ${recipient} with  text ${text}`)
    } else if (attachment) {
      let attachmentType = message.attachments[0].type
      console.log(`${seq}-${mid}-${timeOfMessage}: Received message from user 
        ${sender} and page ${recipient} with attachment of type ${attachmentType}`)
    }
  }

  /*
   * Delivery Confirmation Event
   *
   */
  receivedDeliveryConfirmation (event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var mids = event.delivery.mids
    var watermark = event.delivery.watermark
    var seq = event.delivery.seq

    if (mids) {
      mids.forEach((mid) => {
        console.log(`Received delivery confirmation from user ${sender} and page 
          ${recipient} with mid ${mid} and sequence #${seq}`)
      })
    }
    console.log(`All messages before ${watermark} were delivered`)
  }

  /*
   * Postback Event
   *
   */
  receivedPostback (event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var timeOfPostback = event.timestamp
    var payload = event.postback.payload

    console.log(`Received postback for user ${sender} and page ${recipient} with 
      payload ${payload} at ${timeOfPostback}`)
  }

  /*
   * Message Read Event
   *
   */
  receivedReadConfirmation (event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var timeOfRead = event.timestamp
    var watermark = event.read.watermark
    var seq = event.read.seq

    console.log(`${seq}-${timeOfRead}: All Messages were read from user ${sender} 
      and page ${recipient} before ${watermark}`)
  }

  /*
   * Message Account Linking Event
   *
   */
  receivedAccountLinking (event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var timeOfLink = event.timestamp
    var status = event.account_linking.status

    if (status === 'linked') {
      let authCode = event.account_linking.authorization_code
      console.log(`${timeOfLink}: The user ${sender} and page ${recipient} has 
        linked his account with authorization code ${authCode}`)
    }
    if (status === 'unlinked') {
      console.log(`${timeOfLink}: The user ${sender} and page ${recipient} has 
        unlinked his account`)
    }
  }

  /*
   * Messange event dispatcher
   *
   */
  messageDispatcher (data, cb) {
    // Check that this is a page subscription
    if (data.object === 'page') {
      data.entry.forEach((pageEntry) => {
        var pageId = pageEntry.id
        var timeOfEvent = pageEntry.time

        console.log(`New message event from page ${pageId} at ${timeOfEvent}`)

        pageEntry.messaging.forEach((event) => {
          if (event.message) {
            this.receivedMessage(event)
          } else if (event.optin) {
            this.receivedAuthentication(event)
          } else if (event.delivery) {
            this.receivedDeliveryConfirmation(event)
          } else if (event.postback) {
            this.receivedPostback(event)
          } else if (event.read) {
            this.receivedReadConfirmation(event)
          } else if (event.account_linking) {
            this.receivedAccountLinking(event)
          } else {
            console.log('Webhook received an unknown messaging event: ', event)
          }
        })
      })
    }
  }

  /*
   * Send a plain text message
   *
   */
  sendTextMessage (recipient, text, notificationType, cb) {
    var message = {
      text: text
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send a file attachment (image, audio, video or file)
   * image supported formats [jpg, png and gifs]
   *
   */
  sendFileMessage (recipient, fileType, fileUrl, notificationType, cb) {
    var message = {
      attachment: {
        type: fileType,
        payload: {
          url: fileUrl
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send a button message
   *
   */
  sendButtonMessage (recipient, buttonTemplate, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: buttonTemplate.text,
          buttons: buttonTemplate.buttons
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send a Structured Message
   *
   */
  sendGenericMessage (recipient, elements, notificationType, cb) {
    var message = {
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

  /*
   * Send a receipt message
   *
   */
  sendReceiptMessage (recipient, receipt, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'receipt',
          recipient_name: receipt.recipient_name,
          order_number: receipt.order_number,
          currency: receipt.currency,
          payment_method: receipt.payment_method,
          order_url: receipt.order_url,
          timestamp: receipt.timestamp,
          elements: receipt.shopping_cart,
          address: receipt.recipient_address,
          summary: receipt.order_summary,
          adjustments: receipt.adjustments
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send a quick reply message.
   *
   */
  sendQuickMessage (recipient, quickReplies, notificationType, cb) {
    var message = {
      text: quickReplies.text,
      quick_replies: quickReplies.quick_replies
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send an airplane itinerary message
   *
   */
  sendItineraryMessage (recipient, itinerary, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          type: 'airline_itinerary',
          intro_message: itinerary.intro_message,
          locale: itinerary.locale,
          theme_color: itinerary.theme_color,  // not required, RGB hexadecimal string (default #009ddc)
          pnr_number: itinerary.pnr_number,
          passenger_info: itinerary.passenger_info,  // array of passenger_info
          flight_info: itinerary.flight_info,  // array of flight_info
          passenger_segment_info: itinerary.passenger_segment_info,  // array of passenger_segment_info
          price_info: itinerary.price_info,  // array of price_info, not required, limited to 4
          base_price: itinerary.base_price,  // not required
          tax: itinerary.tax,  // not required
          total_price: itinerary.total_price,
          currency: itinerary.currency  // must be a three digit ISO-4217-3 code
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send an airplane check-in reminder message
   *
   */
  sendCheckinMessage (recipient, checkin, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'airline_checkin',
          intro_message: checkin.intro_message,
          locale: checkin.locale,
          theme_color: checkin.theme_color,  // not required
          pnr_number: checkin.pnr_number,
          flight_info: checkin.flight_info,  // array of flight info
          checkin_url: checkin.checkin_url
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send an Airplane Boarding Pass message
   *
   */
  sendBoardingpassMessage (recipient, boardingpass, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'airline_boardingpass',
          intro_message: boardingpass.intro_message,
          locale: boardingpass.locale,
          theme_color: boardingpass.theme_color,  // not required
          boarding_pass: boardingpass.boarding_pass  // array of boarding_pass
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send a flight update message
   * update_type must be delay, gate_change or cancellation
   *
   */
  sendFlightupdateMessage (recipient, flightupdate, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'airline_update',
          intro_message: flightupdate.intro_message,
          update_type: flightupdate.update_type,
          locale: flightupdate.locale,
          theme_color: flightupdate.theme_color,  // not required
          pnr_number: flightupdate.pnr_number,
          update_flight_info: {
            flight_number: flightupdate.flight_number,
            departure_airport: flightupdate.departure_airport,
            arrival_airport: flightupdate.arrival_airport,
            flight_schedule: {  // must be ISO 8601-based format
              boarding_time: flightupdate.boarding_time,  // not required
              departure_time: flightupdate.departure_time,
              arrival_time: flightupdate.arrival_time  // not required
            }
          }
        }
      }
    }
    this.sendApiMessage(recipient, message, notificationType, cb)
  }

  /*
   * Send a message to a user.
   *
   */
  sendApiMessage (recipient, message, notificationType, cb) {
    if (typeof notificationType === 'function') {
      cb = notificationType
      notificationType = this.notificationType
    }
    if (!recipient.id && !recipient.phoneNumber) {
      throw new Error('Send API message error: recipient id or phone number must be set')
    }
    const req = {
      url: `${apiUrl}me/messages`,
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipient.id || null,
          phone_number: recipient.phoneNumber || null
        },
        message: message,
        notification_type: notificationType
      }
    }
    sendRequest(req, cb)
  }

  /*
   * Send Sender Actions
   *
   */
  sendSenderAction (recipient, senderAction, cb) {
    if (!recipient.id && !recipient.phoneNumber) {
      throw new Error('Sender action error: recipient id or phone number must be set')
    }
    const req = {
      url: `${apiUrl}me/messages`,
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipient.id || null,
          phone_number: recipient.phoneNumber || null
        },
        sender_action: senderAction
      }
    }
    sendRequest(req, cb)
  }

  /*
   * Set a greeting text
   *
   */
  setGreetingText (message, cb) {
    if (typeof message === 'string') {
      message = {text: message}
    }
    var method = 'POST'
    var params = {
      setting_type: 'greeting',
      greeting: message
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Set a Get Started Button
   *
   */
  setGetStartedButton (message, cb) {
    if (typeof message === 'string') {
      message = [{
        payload: message
      }]
    }
    var method = 'POST'
    var params = {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
      call_to_actions: {
        payload: message
      }
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Set a Persistent Menu
   *
   */
  setPersistentMenu (items, cb) {
    var method = 'POST'
    var params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions: items
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Delete Thread Setting [Get Started Button('new_thread') or Persistent Menu('existing_thread')]
   *
   */
  deleteThreadSetting (threadType, cb) {
    var method = 'DELETE'
    var params = {
      setting_type: 'call_to_actions',
      thread_state: threadType
    }
    this.sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Configure the Thread Settings on Messenger
   *
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

  /*
   * Retrieve the user page-scoped ID (PSID) using the account linking endpoint
   *
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

  /*
   * Unlink Account
   *
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

  /*
   * Account linking call-2-action
   *
   */
  sendAccountLinking (recipient, text, serverUrl, cb) {
    var message = {
      attachment: {
        type: 'tempalte',
        payload: {
          template_type: 'button',
          text: text,
          buttons: [{
            type: 'account_link',
            url: `${serverUrl}/authorize`
          }]
        }
      }
    }
    this.sendApiMessage(recipient, message, cb)
  }

  /*
   * Get the User Profile
   *
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

  /*
   * Helper function
   *
   */
  getAttachmentType (attachment, cb) {
    switch (attachment[0].type) {
      case ('image'):
        return 'image'
      case ('audio'):
        return 'audio'
      case ('video'):
        return 'video'
      case ('file'):
        return 'file'
      case ('location'):
        return 'location'
      case ('template'):
        return 'template'
      case ('fallback'):
        return 'fallback'
      default:
        return 'undefined'
    }
  }

  // TODO: Send API request fails
  // Internal Errors, Rate Limited Errors, Bad Parameter Errors, Access Token Errors, Permission Errors, User Block Errors, Account Linking Errors. read more at https://developers.facebook.com/docs/messenger-platform/send-api-reference#errors
}

  /*
   * Send Request to API
   *
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
