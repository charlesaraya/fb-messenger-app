'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var apiUrl = 'https://graph.facebook.com/v2.6/';

var Messenger = function () {
  function Messenger(token, notificationType) {
    _classCallCheck(this, Messenger);

    this.token = token || null;
    this.notificationType = notificationType || 'REGULAR';

    if (!this.token) throw new Error('Facebook Page token is missing');
  }

  /*
   * Subscribe App via API
   *
   */


  _createClass(Messenger, [{
    key: 'subscribeApp',
    value: function subscribeApp(cb) {
      var req = {
        url: apiUrl + 'me/subscribed_apps',
        qs: {
          access_token: this.token
        },
        method: 'POST',
        json: true
      };
      sendRequest(req, cb);
    }

    /*
     * Authorization Event
     *
     */

  }, {
    key: 'receivedAuthentication',
    value: function receivedAuthentication(event) {
      var sender = event.sender.id;
      var recipient = event.recipient.id;
      var timeOfAuth = event.timestamp;
      var passThroughParam = event.optin.ref;

      console.log('Authentication received for user ' + sender + ' and page ' + recipient + ' \n      with pass-through param ' + passThroughParam + ' at ' + timeOfAuth);
    }

    /*
     * Received Message Event
     *
     */

  }, {
    key: 'receivedMessage',
    value: function receivedMessage(event) {
      var sender = event.sender.id;
      var recipient = event.recipient.id;
      var timeOfMessage = event.timestamp;
      var message = event.message;
      var mid = message.mid;
      var seq = message.seq;

      var isEcho = message.is_echo;
      var metadata = message.metadata;
      var appId = message.app_id;
      var quickReply = message.quick_reply;
      var text = message.text;
      var attachment = message.attachments;

      if (isEcho) {
        // When a message has been send by your page
        console.log(seq + '-' + mid + '-' + timeOfMessage + ': Received echo message from app \n        ' + appId + ', page ' + sender + ' and user ' + recipient + ' with metadata ' + metadata);
        return;
      } else if (quickReply) {
        var quickReplyPayload = quickReply.payload;
        console.log(seq + '-' + mid + '-' + timeOfMessage + ': Quick reply received from \n        user ' + sender + ' and page ' + recipient + ' with text ' + text + ' and payload \n        ' + quickReplyPayload);
        return;
      }
      // When a message has been send to your page
      if (text) {
        console.log(seq + '-' + mid + '-' + timeOfMessage + ': Received message from user \n        ' + sender + ' and page ' + recipient + ' with  text ' + text);
      } else if (attachment) {
        var attachmentType = message.attachments[0].type;
        console.log(seq + '-' + mid + '-' + timeOfMessage + ': Received message from user \n        ' + sender + ' and page ' + recipient + ' with attachment of type ' + attachmentType);
      }
    }

    /*
     * Delivery Confirmation Event
     *
     */

  }, {
    key: 'receivedDeliveryConfirmation',
    value: function receivedDeliveryConfirmation(event) {
      var sender = event.sender.id;
      var recipient = event.recipient.id;
      var mids = event.delivery.mids;
      var watermark = event.delivery.watermark;
      var seq = event.delivery.seq;

      if (mids) {
        mids.forEach(function (mid) {
          console.log('Received delivery confirmation from user ' + sender + ' and page \n          ' + recipient + ' with mid ' + mid + ' and sequence #' + seq);
        });
      }
      console.log('All messages before ' + watermark + ' were delivered');
    }

    /*
     * Postback Event
     *
     */

  }, {
    key: 'receivedPostback',
    value: function receivedPostback(event) {
      var sender = event.sender.id;
      var recipient = event.recipient.id;
      var timeOfPostback = event.timestamp;
      var payload = event.postback.payload;

      console.log('Received postback for user ' + sender + ' and page ' + recipient + ' with \n      payload ' + payload + ' at ' + timeOfPostback);
    }

    /*
     * Message Read Event
     *
     */

  }, {
    key: 'receivedReadConfirmation',
    value: function receivedReadConfirmation(event) {
      var sender = event.sender.id;
      var recipient = event.recipient.id;
      var timeOfRead = event.timestamp;
      var watermark = event.read.watermark;
      var seq = event.read.seq;

      console.log(seq + '-' + timeOfRead + ': All Messages were read from user ' + sender + ' \n      and page ' + recipient + ' before ' + watermark);
    }

    /*
     * Message Account Linking Event
     *
     */

  }, {
    key: 'receivedAccountLinking',
    value: function receivedAccountLinking(event) {
      var sender = event.sender.id;
      var recipient = event.recipient.id;
      var timeOfLink = event.timestamp;
      var status = event.account_linking.status;

      if (status === 'linked') {
        var authCode = event.account_linking.authorization_code;
        console.log(timeOfLink + ': The user ' + sender + ' and page ' + recipient + ' has \n        linked his account with authorization code ' + authCode);
      }
      if (status === 'unlinked') {
        console.log(timeOfLink + ': The user ' + sender + ' and page ' + recipient + ' has \n        unlinked his account');
      }
    }

    /*
     * Messange event dispatcher
     *
     */

  }, {
    key: 'messageDispatcher',
    value: function messageDispatcher(data, cb) {
      var _this = this;

      // Check that this is a page subscription
      if (data.object === 'page') {
        data.entry.forEach(function (pageEntry) {
          var pageId = pageEntry.id;
          var timeOfEvent = pageEntry.time;

          console.log('New message event from page ' + pageId + ' at ' + timeOfEvent);

          pageEntry.messaging.forEach(function (event) {
            if (event.message) {
              _this.receivedMessage(event);
            } else if (event.optin) {
              _this.receivedAuthentication(event);
            } else if (event.delivery) {
              _this.receivedDeliveryConfirmation(event);
            } else if (event.postback) {
              _this.receivedPostback(event);
            } else if (event.read) {
              _this.receivedReadConfirmation(event);
            } else if (event.account_linking) {
              _this.receivedAccountLinking(event);
            } else {
              console.log('Webhook received an unknown messaging event: ', event);
            }
          });
        });
      }
    }

    /*
     * Send a plain text message
     *
     */

  }, {
    key: 'sendTextMessage',
    value: function sendTextMessage(recipient, text, notificationType, cb) {
      var message = {
        text: text
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send a file attachment (image, audio, video or file)
     * image supported formats [jpg, png and gifs]
     *
     */

  }, {
    key: 'sendFileMessage',
    value: function sendFileMessage(recipient, fileType, fileUrl, notificationType, cb) {
      var message = {
        attachment: {
          type: fileType,
          payload: {
            url: fileUrl
          }
        }
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send a button message
     *
     */

  }, {
    key: 'sendButtonMessage',
    value: function sendButtonMessage(recipient, buttonTemplate, notificationType, cb) {
      var message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: buttonTemplate.text,
            buttons: buttonTemplate.buttons
          }
        }
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send a Structured Message
     *
     */

  }, {
    key: 'sendGenericMessage',
    value: function sendGenericMessage(recipient, elements, notificationType, cb) {
      var message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: elements
          }
        }
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send a receipt message
     *
     */

  }, {
    key: 'sendReceiptMessage',
    value: function sendReceiptMessage(recipient, receipt, notificationType, cb) {
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
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send a quick reply message.
     *
     */

  }, {
    key: 'sendQuickMessage',
    value: function sendQuickMessage(recipient, quickReplies, notificationType, cb) {
      var message = {
        text: quickReplies.text,
        quick_replies: quickReplies.quick_replies
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send an airplane itinerary message
     *
     */

  }, {
    key: 'sendItineraryMessage',
    value: function sendItineraryMessage(recipient, itinerary, notificationType, cb) {
      var message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'airline_itinerary',
            intro_message: itinerary.intro_message,
            locale: itinerary.locale,
            theme_color: itinerary.theme_color, // not required, RGB hexadecimal string (default #009ddc)
            pnr_number: itinerary.pnr_number,
            passenger_info: itinerary.passenger_info, // array of passenger_info
            flight_info: itinerary.flight_info, // array of flight_info
            passenger_segment_info: itinerary.passenger_segment_info, // array of passenger_segment_info
            price_info: itinerary.price_info, // array of price_info, not required, limited to 4
            base_price: itinerary.base_price, // not required
            tax: itinerary.tax, // not required
            total_price: itinerary.total_price,
            currency: itinerary.currency // must be a three digit ISO-4217-3 code
          }
        }
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send an airplane check-in reminder message
     *
     */

  }, {
    key: 'sendCheckinMessage',
    value: function sendCheckinMessage(recipient, checkin, notificationType, cb) {
      var message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'airline_checkin',
            intro_message: checkin.intro_message,
            locale: checkin.locale,
            theme_color: checkin.theme_color, // not required
            pnr_number: checkin.pnr_number,
            flight_info: checkin.flight_info, // array of flight info
            checkin_url: checkin.checkin_url
          }
        }
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send an Airplane Boarding Pass message
     *
     */

  }, {
    key: 'sendBoardingpassMessage',
    value: function sendBoardingpassMessage(recipient, boardingpass, notificationType, cb) {
      var message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'airline_boardingpass',
            intro_message: boardingpass.intro_message,
            locale: boardingpass.locale,
            theme_color: boardingpass.theme_color, // not required
            boarding_pass: boardingpass.boarding_pass // array of boarding_pass
          }
        }
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send a flight update message
     * update_type must be delay, gate_change or cancellation
     *
     */

  }, {
    key: 'sendFlightupdateMessage',
    value: function sendFlightupdateMessage(recipient, flightupdate, notificationType, cb) {
      var message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'airline_update',
            intro_message: flightupdate.intro_message,
            update_type: flightupdate.update_type,
            locale: flightupdate.locale,
            theme_color: flightupdate.theme_color, // not required
            pnr_number: flightupdate.pnr_number,
            update_flight_info: {
              flight_number: flightupdate.update_flight_info.flight_number,
              departure_airport: {
                airport_code: flightupdate.update_flight_info.departure_airport.airport_code,
                city: flightupdate.update_flight_info.departure_airport.city,
                terminal: flightupdate.update_flight_info.departure_airport.terminal,
                gate: flightupdate.update_flight_info.departure_airport.gate
              },
              arrival_airport: {
                airport_code: flightupdate.update_flight_info.arrival_airport.airport_code,
                city: flightupdate.update_flight_info.arrival_airport.city,
                terminal: flightupdate.update_flight_info.arrival_airport.terminal,
                gate: flightupdate.update_flight_info.arrival_airport.gate
              },
              flight_schedule: { // must be ISO 8601-based format
                boarding_time: flightupdate.update_flight_info.flight_schedule.boarding_time, // not required
                departure_time: flightupdate.update_flight_info.flight_schedule.departure_time,
                arrival_time: flightupdate.update_flight_info.flight_schedule.arrival_time // not required
              }
            }
          }
        }
      };
      this.sendApiMessage(recipient, message, notificationType, cb);
    }

    /*
     * Send a message to a user.
     *
     */

  }, {
    key: 'sendApiMessage',
    value: function sendApiMessage(recipient, message, notificationType, cb) {
      if (typeof notificationType === 'function') {
        cb = notificationType;
        notificationType = this.notificationType;
      }
      /*
      if (!recipient.id && !recipient.phoneNumber) {
        throw new Error('Send API message error: recipient id or phone number must be set')
      }
      */
      var req = {
        url: apiUrl + 'me/messages',
        qs: {
          access_token: this.token
        },
        method: 'POST',
        json: {
          recipient: {
            /*
            id: recipient.id || null,
            phone_number: recipient.phoneNumber || null
            */
            id: recipient // fix id/phone_number
          },
          message: message,
          notification_type: notificationType
        }
      };
      sendRequest(req, cb);
    }

    /*
     * Send Sender Actions
     *
     */

  }, {
    key: 'sendSenderAction',
    value: function sendSenderAction(recipient, senderAction, cb) {
      if (!recipient.id && !recipient.phoneNumber) {
        throw new Error('Sender action error: recipient id or phone number must be set');
      }
      var req = {
        url: apiUrl + 'me/messages',
        qs: {
          access_token: this.token
        },
        method: 'POST',
        json: {
          recipient: {
            /*
            id: recipient.id || null,
            phone_number: recipient.phoneNumber || null
            */
            id: recipient // fix recipient id/phone_number
          },
          sender_action: senderAction
        }
      };
      sendRequest(req, cb);
    }

    /*
     * Set a greeting text
     *
     */

  }, {
    key: 'setGreetingText',
    value: function setGreetingText(message, cb) {
      if (typeof message === 'string') {
        message = { text: message };
      }
      var method = 'POST';
      var params = {
        setting_type: 'greeting',
        greeting: message
      };
      this.sendThreadSettingsRequest(method, params, cb);
    }

    /*
     * Set a Get Started Button
     *
     */

  }, {
    key: 'setGetStartedButton',
    value: function setGetStartedButton(message, cb) {
      if (typeof message === 'string') {
        message = [{
          payload: message
        }];
      }
      var method = 'POST';
      var params = {
        setting_type: 'call_to_actions',
        thread_state: 'new_thread',
        call_to_actions: {
          payload: message
        }
      };
      this.sendThreadSettingsRequest(method, params, cb);
    }

    /*
     * Set a Persistent Menu
     *
     */

  }, {
    key: 'setPersistentMenu',
    value: function setPersistentMenu(items, cb) {
      var method = 'POST';
      var params = {
        setting_type: 'call_to_actions',
        thread_state: 'existing_thread',
        call_to_actions: items
      };
      this.sendThreadSettingsRequest(method, params, cb);
    }

    /*
     * Delete Thread Setting [Get Started Button('new_thread') or Persistent Menu('existing_thread')]
     *
     */

  }, {
    key: 'deleteThreadSetting',
    value: function deleteThreadSetting(threadType, cb) {
      var method = 'DELETE';
      var params = {
        setting_type: 'call_to_actions',
        thread_state: threadType
      };
      this.sendThreadSettingsRequest(method, params, cb);
    }

    /*
     * Configure the Thread Settings on Messenger
     *
     */

  }, {
    key: 'sendThreadSettingsRequest',
    value: function sendThreadSettingsRequest(method, params, cb) {
      var req = {
        url: apiUrl + 'me/thread_settings',
        qs: {
          access_token: this.token
        },
        method: method,
        json: params
      };
      sendRequest(req, cb);
    }

    /*
     * Retrieve the user page-scoped ID (PSID) using the account linking endpoint
     *
     */

  }, {
    key: 'getUserPsid',
    value: function getUserPsid(token, cb) {
      var req = {
        url: apiUrl + 'me',
        qs: {
          access_token: this.token,
          fields: 'recipient',
          account_linking_token: token
        },
        method: 'GET',
        json: true
      };
      sendRequest(req, cb);
    }

    /*
     * Unlink Account
     *
     */

  }, {
    key: 'unlinkAccount',
    value: function unlinkAccount(psid, cb) {
      var req = {
        url: apiUrl + 'me/unlink_accounts',
        qs: {
          access_token: this.token
        },
        method: 'POST',
        json: {
          psid: psid
        }
      };
      sendRequest(req, cb);
    }

    /*
     * Account linking call-2-action
     *
     */

  }, {
    key: 'sendAccountLinking',
    value: function sendAccountLinking(recipient, text, serverUrl, cb) {
      var message = {
        attachment: {
          type: 'tempalte',
          payload: {
            template_type: 'button',
            text: text,
            buttons: [{
              type: 'account_link',
              url: serverUrl + '/authorize'
            }]
          }
        }
      };
      this.sendApiMessage(recipient, message, cb);
    }

    /*
     * Get the User Profile
     *
     */

  }, {
    key: 'getUserProfile',
    value: function getUserProfile(userId, cb) {
      var req = {
        url: '' + apiUrl + userId,
        qs: {
          access_token: this.token,
          fields: 'first_name,last_name,profile_pic,locale,timezone,gender'
        },
        method: 'GET',
        json: true
      };
      sendRequest(req, cb);
    }

    /*
     * Helper function
     *
     */

  }, {
    key: 'getAttachmentType',
    value: function getAttachmentType(attachment, cb) {
      switch (attachment[0].type) {
        case 'image':
          return 'image';
        case 'audio':
          return 'audio';
        case 'video':
          return 'video';
        case 'file':
          return 'file';
        case 'location':
          return 'location';
        case 'template':
          return 'template';
        case 'fallback':
          return 'fallback';
        default:
          return 'undefined';
      }
    }

    // TODO: Send API request fails
    // Internal Errors, Rate Limited Errors, Bad Parameter Errors, Access Token Errors, Permission Errors, User Block Errors, Account Linking Errors. read more at https://developers.facebook.com/docs/messenger-platform/send-api-reference#errors

  }]);

  return Messenger;
}();

/*
 * Send Request to API
 *
 */


var sendRequest = function sendRequest(req, cb) {
  (0, _request2.default)(req, function (error, response, body) {
    if (!cb) return;
    if (error) return cb(error);
    if (response.body.error) return cb(response.body.error);
    cb(null, response.body);
  });
};

exports.default = Messenger;