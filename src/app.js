import request from 'request'

class Messenger {

  constructor (token, notificationType) {
    this.token = token
    this.notificationType = notificationType || 'REGULAR'
  }

  /*
   * Authorization Event
   *
   */
  subscribeApp (token, cb) {
    const req = {
      url: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
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

    console.log('Authentication received for user %d and page %d with pass ' +
      "through param '%s' at %d", sender, recipient, passThroughParam, timeOfAuth)
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

    if (message.is_echo) {
      // When a message has been send by your page
      console.log('%d-%d-%d: Received Echo Message from app %d, page %d and user %d. Metadata %d', seq, mid, timeOfMessage, message.app_id, sender, recipient, message.metadata)
      if (message.attachments) {
        let attachmentType = this.getAttachmentType(message.attachments)
        console.log('Attachment received of type %s', attachmentType)
      }
    } else {
      // When a message has been send to your page
      if (message.text) {
        console.log('%d-%d-%d: Received Echo Message from user %d and page %d. Text: %s', seq, mid, timeOfMessage, sender, recipient, message.text)
      }
      if (message.quick_reply) {
        console.log('Quick reply received with payload %s', message.quick_reply.payload)
      }
      if (message.attachments) {
        let attachmentType = this.getAttachmentType(message.attachments)
        console.log('Attachment received of type %s', attachmentType)
      }
    }
  }

  /*
   * Delivery Confirmation Event
   *
   */
  receivedDeliveryConfirmation (event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var messages = event.delivery.mids
    var watermark = event.delivery.watermark
    var sequence = event.delivery.seq

    if (messages) {
      messages.forEach((message) => {
        console.log('Received delivery confirmation from user %d and page %d for message ID: %s and sequence #%d', sender, recipient, message, sequence)
      })
    }
    console.log('All messages before %d were delivered', watermark)
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

    console.log("Received postback for user %d and page %d with payload '%s' at %d", sender, recipient, payload, timeOfPostback)
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
    var sequence = event.read.seq

    console.log('%d-$d: All Messages were read from user %d and page %d before %d', timeOfRead, sequence, sender, recipient, watermark)
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
      console.log('%d: The user %d and page %d has linked his account. Authorization code: %s', timeOfLink, sender, recipient, authCode)
    }
    if (status === 'unlinked') {
      console.log('%d: The user %d and page %d has unlinked his account', timeOfLink, sender, recipient)
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

        console.log('New message event from page %d at %d', pageId, timeOfEvent)

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
  sendTextMessage (recipientId, text, notificationType, cb) {
    var message = {
      text: text
    }
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a file attachment (image, audio, video or file)
   * image supported formats [jpg, png and gifs]
   *
   */
  sendFileMessage (recipientId, fileType, fileUrl, notificationType, cb) {
    var message = {
      attachment: {
        type: fileType,
        payload: {
          url: fileUrl
        }
      }
    }
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a button message
   *
   */
  sendButtonMessage (recipientId, buttonTemplate, notificationType, cb) {
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
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a Structured Message
   *
   */
  sendGenericMessage (recipientId, elements, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements
        }
      }
    }
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a receipt message
   *
   */
  sendReceiptMessage (recipientId, receipt, notificationType, cb) {
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
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a quick reply message.
   *
   */
  sendQuickMessage (recipientId, quickReplies, notificationType, cb) {
    var message = {
      text: quickReplies.text,
      quick_replies: quickReplies.quick_replies
    }
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an airplane itinerary message
   *
   */
  sendItineraryMessage (recipientId, itinerary, notificationType, cb) {
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
          prince_info: itinerary.price_info,  // array of price_info, not required, limited to 4
          base_price: itinerary.base_price,  // not required
          tax: itinerary.tax,  // not required
          total_price: itinerary.total_price,
          currency: itinerary.currency  // must be a three digit ISO-4217-3 code
        }
      }
    }
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an airplane check-in reminder message
   *
   */
  sendCheckinMessage (recipientId, checkin, notificationType, cb) {
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
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an Airplane Boarding Pass message
   *
   */
  sendBoardingpassMessage (recipientId, boardingpass, notificationType, cb) {
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
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a flight update message
   * update_type must be delay, gate_change or cancellation
   *
   */
  sendFlightupdateMessage (recipientId, flightupdate, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'airline_update',
          intro_message: flightupdate,
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
    this.sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a message to a user.
   *
   */
  sendApiMessage (recipientId, message, notificationType, cb) {
    if (typeof notificationType === 'function') {
      cb = notificationType
      notificationType = this.notificationType
    }
    const req = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipientId
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
  sendSenderAction (recipientId, senderAction, cb) {
    const req = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: this.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipientId
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
      url: 'https://graph.facebook.com/v2.6/me/thread_settings',
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
      url: 'https://graph.facebook.com/v2.6/me',
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
      url: 'https://graph.facebook.com/v2.6/me/unlink_accounts',
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
   * Get the User Profile
   *
   */
  getUserProfile (userId, cb) {
    const req = {
      url: `https://graph.facebook.com/v2.6/${userId}`,
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
