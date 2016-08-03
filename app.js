import request from 'request'

class Messenger {

  constructor (token, notificationType) {
    this.token = token
    this.notificationType = notificationType || 'REGULAR'
  }

  /*
   * Messange event dispatcher
   */
  messageDispatcher(data, cb) {
    // Check that this is a page subscription
    if (data.object == 'page') {

      data.entry.forEach((pageEntry) => {
        var pageId = pageEntry.id
        var timeOfEvent = pageEntry.time

        pageEntry.messaging.forEach((event) => {
          if (event.message) {
            //TODO: is_echo (Message with text message, with image, audio, video or file attachment, with fallback attachment, with template attachment)
            receivedMessage(event)
          } else if (event.optin) {
            receivedAuthentication(event)
          } else if (event.delivery) {
            receivedDeliveryConfirmation(event)
          } else if (event.postback) {
            receivedPostback(event)
          } else if (event.read) {
            receivedReadConfirmation(event)
          } else {
            console.log('Webhook received an unknown messaging event: ', event)
          }
          // TODO: Account linking
        })
      })
    }
  }

  /*
   * Authorization Event
   *
   */
  receivedAuthentication(event) {
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
  receivedMessage(event) {
    var sender = event.sender.id
    var recipient =  event.recipient.id
    var timeOfMessage = event.timestamp
    var message = event.message

    console.log('Received Message from user %d and page %d at %d with message: ', 
      sender, recipient, timeOfMessage, message)
  }

  /*
   * Delivery Confirmation Event
   *
   */
  receivedDeliveryConfirmation(event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var messages = event.delivery.mids
    var watermark = event.delivery.watermark
    var sequence = event.delivery.seq

    if (messages) {
      messages.forEach((message) => {
        console.log('Received delivery confirmation for message ID: %s', message)
      })
    }
    console.log('All messages before %d were delivered', watermark)
  }

  /*
   * Postback Event
   *
   */
  receivedPostback(event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var timeOfPostback = event.timestamp
    var payload = event.postback.payload

    console.log("Received postback for user %d and page %d with payload '%s' at %d", 
      sender, recipient, payload, timeOfPostback)
  }

  /*
   * Message Read Event
   *
   */
  receivedReadConfirmation(event) {
    var sender = event.sender.id
    var recipient = event.recipient.id
    var timeOfRead = event.timestamp
    var watermark = event.read.watermark
    var sequence = event.read.seq

    console.log('All Messages were read from user %d and page %d at %d', sender, 
      recipient, timeOfRead)
  }

  /*
   * Send a plain text message
   *
   */
  sendTextMessage(recipientId, text, notificationType, cb) {
    var message = {
      text: text
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an image (jpg, png and gifs)
   *
   */
  sendImageMessage(recipientId, imgUrl, notificationType, cb) {
    var message = {
      attachment: {
        type: 'image',
        payload: {
          url: imgUrl
        }
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an audio
   *
   */
  sendAudioMessage(recipientId, audioUrl, notificationType, cb) {
    var message = {
      attachment: {
        type: 'audio',
        payload: {
          url: audioUrl
        }
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a video
   *
   */
  sendVideoMessage(recipientId, videoUrl, notificationType, cb) {
    var message = {
      attachment: {
        type: 'video',
        payload: {
          url: videoUrl
        }
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a file
   *
   */
  sendFileMessage(recipientId, fileUrl, notificationType, cb) {
    var message = {
      attachment: {
        type: 'video',
        payload: {
          url: fileUrl
        }
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a button message
   *
   */
   sendButtonMessage(recipientId, buttonTemplate, notificationType, cb) {
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
    sendApiMessage(recipientId, message, notificationType, cb)
   }

  /*
   * Send a Structured Message
   *
   */
  sendGenericMessage(recipientId, elements, notificationType, cb) {
    if (typeof elements != 'array') {
      elements = [elements]
    }
    var message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements
        }
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a receipt message
   *
   */
  sendReceiptMessage(recipientId, receipt, notificationType, cb) {
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
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a quick reply message.
   *
   */
  sendQuickMessage(recipientId, quickReplies, notificationType, cb) {
    var message = {
      text: quickReplies.text,
      quick_replies: quickReplies.quick_replies
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an airplane itinerary message
   *
   */
  sendItineraryMessage(recipientId, itinerary, notificationType, cb) {
    var message = {
      attachment: {
        type: "template",
        payload: itinerary
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an airplane check-in reminder message
   *
   */
  sendCheckinMessage(recipientId, checkin, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: checkin
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send an Airplane Boarding Pass message
   *
   */
  sendBoardingpassMessage(recipientId, boardingpass, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: boardingpass
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  /*
   * Send a flight update message
   *
   */
  sendFlightupdateMessage(recipientId, flightupdate, notificationType, cb) {
    var message = {
      attachment: {
        type: 'template',
        payload: flightupdate
      }
    }
    sendApiMessage(recipientId, message, notificationType, cb)
  }

  // TODO: Phone Number
  //You can send a message to a user without requiring the user interacting with the page first, by specifying a phone_number. Requires the pages_messaging_phone_number permission. read more at https://developers.facebook.com/docs/messenger-platform/send-api-reference#phone_number

  /*
   * Send a message to a user.
   *
   */
  sendApiMessage(recipientId, message, notificationType, cb) {
    if (typeof notificationType === 'function') {
      cb = notificationType
      notificationType = NOTIFICATION_TYPE
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
  sendSenderAction(recipientId, senderAction, cb) {
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
  setGreetingText(message, cb) {
    if (typeof message === 'string') {
      message = {text: message}
    }
    var method = 'POST'
    var params = {
      setting_type: 'greeting',
      greeting: message
    }
    sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Set a Get Started Button
   *
   */
  setGetStartedButton(message, cb) {
    if (typeof message === 'string') {
      message = [{
        payload: message
      }]
    }
    var method = 'POST'
    var params =  {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
      call_to_actions : {
        payload: message
      }
    }
    sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Delete the Get Started Button
   *
   */
  deleteGetStartedButton(cb) {
    var method = 'DELETE'
    var params =  {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread'
    }
    sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Set a Persistent Menu
   * 
   */
  setPersistentMenu(items, cb) {
    var method = 'POST'
    var params =  {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions : items
    }
    sendThreadSettingsRequest(method, params, cb)
  }

  /*
   * Delete the Persistent Menu
   *
   */
  deletePersistentMenu(cb) {
    var method = 'DELETE'
    var params = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread'
    }
    sendThreadSettingsRequest(method, params, cb)
  }

  sendThreadSettingsRequest(method, params, cb) {
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
   * Get the User Profile
   *
   */
  getUserProfile(userId, cb) {
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
   * Send Request to API
   *
   */
  const sendRequest = (req, cb) => {
    request(req, (error, response, body) => {
      if (!cb) 
        return
      if (error) 
        return cb(error)
      if (response.body.error) 
        return cb(response.body.error)
      cb(null, response.body)
    })
  }

  //TODO: Send API request fails
  //Internal Errors, Rate Limited Errors, Bad Parameter Errors, Access Token Errors, Permission Errors, User Block Errors, Account Linking Errors. read more at https://developers.facebook.com/docs/messenger-platform/send-api-reference#errors
}

export default Messenger