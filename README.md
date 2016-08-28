# Facebook Messenger Platform App

#### NodeJS API adapter

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/fb-messenger-app) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![npm](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e49cfaf866174e5fa9053cc2e894927f)](https://www.codacy.com/app/charlesaraya/fb-messenger-app?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=charlesaraya/fb-messenger-app&amp;utm_campaign=Badge_Grade)

## Installation

```bash
npm install fb-messenger-app
```

### How to start

I take for granted that you've already [setup your Messenger Platform app](https://developers.facebook.com/docs/messenger-platform/quickstart):

1. Create a Facebook App and Page
2. Setup Webhook
3. Get a Page Access Token
4. Subscribe the App to the Page

After installing the fb-messenger-app package with npm as shown above, you'll have to requiere it in your app

```js
const MessengerApp = require('fb-messenger-app')
```

Then create a new messenger instance passing your Facebook App page access token (this token will include all messenger permissions)

```js
var messenger = new MessengerApp(MY_PAGE_ACCESS_TOKEN)
```

### Receive Messages

You'll have to listen for _POST_ calls at your webhook. [Callbacks](https://developers.facebook.com/docs/messenger-platform/webhook-reference#format) will be made to this webhook. As the Messenger Platform [guide](https://developers.facebook.com/docs/messenger-platform/quickstart#steps) shows, you'll have to iterate over each page subscription and every messaging event

```js
if (data.object === 'page') {
  data.entry.forEach(function(pageEntry) {
    pageEntry.messaging.forEach(function(messagingEvent) {
      if (messagingEvent.optin) {
        messenger.receivedAuthentication(messagingEvent);
      } else if (messagingEvent.message) {
        messenger.receivedMessage(messagingEvent);
      } else if (messagingEvent.delivery) {
        messenger.receivedDeliveryConfirmation(messagingEvent);
      } else if (messagingEvent.postback) {
        messenger.receivedPostback(messagingEvent);
      } else if (event.account_linking) {
        messenger.receivedAccountLinking(event)
      } else {
        console.log('Webhook received unknown messagingEvent: ', messagingEvent);
      }
    })
  })
}
```

There's a build-in dispatcher that handles all messaging events

```js 
app.post('/webhook', function (req, res) {
  var data = req.body
  messenger.messageDispatcher(res, data)
})
```

### Send Messages to the user

All send Message methods call to ```sendApiMessage```. It'll make POST calls to facebook's Graph API with your app's page access token, and a JSON payload with the 'recipient's id' and the message object to be send (text, image, audio, structured message, receipt, quick replies, airline itinerary, etc.).

```js
messenger.sendTextMessage(USER_ID, 'Howdy!')
messenger.sendFileMessage(USER_ID, 'image', 'http://giphy.com/gifs/80s-go-bots-go-bots-wiNiBviTrV6ww')
messenger.sendGenericMessage(USER_ID, genericData)
messenger.sendCheckinMessage(USER_ID, userCheckin)
```

### Using callbacks

```js
messenger.sendGenericMessage(USER_ID, myBrandProducts, function (err, body) {
  if (err) return console.log('Something went wrong: could not send my brand products')
  console.log('Generic message with my brand products where send to %d', USER_ID)
})
```

### Notifications types

Depending on your app's flow, generally you'll bring the users attention, or just let them know without disturbing them, but sometimes it will be the case that you won't have to disturb them at all.

```js
messenger.sendTextMessage(USER_ID, 'Hey! Check this out!', 'REGULAR')
messenger.sendTextMessage(USER_ID, 'Check this out, there's no hurry...', 'SILENT_PUSH')
messenger.sendTextMessage(USER_ID, 'If you see this message, check this out', 'NO_PUSH')
```

#### Changing the default notifications type

You can change the app's notification type default. If ```undefined```, It will be set to 'REGULAR' by default.

```js
var messenger = new MessengerApp(MY_PAGE_ACCESS_TOKEN, MY_NOTIFICATION_TYPE)
```

## API

##### Constructor

```js
var messenger = new MessengerApp(token[, notificationType])
```

##### Functions

```js
messenger.sendTextMessage(id, stringMessage[, notificationType][, cb])

messenger.sendFileMessage(recipient, fileType, fileUrl[, notificationType][, cb])

messenger.sendButtonMessage(recipient, buttonTemplate, buttons[, notificationType][, cb])

messenger.sendGenericMessage(recipient, elements[, notificationType][, cb])

messenger.sendReceiptMessage(recipient, receipt[, notificationType][, cb])

messenger.sendQuickMessage(recipient, quickReplies[, notificationType][, cb])

messenger.sendItineraryMessage(recipient, itinerary[, notificationType][, cb])

messenger.sendCheckinMessage(recipient, checkin[, notificationType][, cb])

messenger.sendBoardingpassMessage(recipient, boardingpass[, notificationType][, cb])

messenger.sendFlightupdateMessage(recipient, flightupdate[, notificationType][, cb])

messenger.sendApiMessage(recipient, message[, notificationType][, cb])

messenger.sendSenderAction(recipient, senderAction[, cb])

messenger.getUserProfile(userId[, cb])

messenger.setGreetingText(greeting[, cb])

messenger.setGetStartedButton(message[, cb])

messenger.setPersistentMenu(menuItems[, cb])

messenger.sendThreadSettingsRequest(method, params[, cb])

messenger.deleteThreadSetting(threadType[, cb])

messenger.subscribeApp([cb])

messenger.getUserPsid(tokeb[, cb])

messenger.unlinkAccount(psid[, cb])

messenger.sendAccountLinking(recipient, title, imageUrl, serverUrl[, cb])
```

#### Notification Types

Notification Types are optional; by default, messages will be _REGULAR_ push notification type.
- __REGULAR__ : will emit a sound/vibration and a phone notification
- __SILENT_PUSH__ : will just emit a phone notification
- __NO_PUSH__ : will not emit either

#### Sender Actions

Set typing indicators or send read receipts.
- __mark_seen__ : Mark last message as read
- __typing_on__ : Turn typing indicators on
- __typing_off__ : Turn typing indicators off

## License

### Code

[MIT License](https://github.com/charlesaraya/fb-messenger-app/blob/master/LICENSE).