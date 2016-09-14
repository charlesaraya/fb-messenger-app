# Facebook Messenger Platform App

#### Node API adapter in ECMAScript 2015 (ES6)

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/fb-messenger-app) [![npm](https://img.shields.io/npm/dm/fb-messenger-app.svg)](https://www.npmjs.com/package/fb-messenger-app) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![npm](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e49cfaf866174e5fa9053cc2e894927f)](https://www.codacy.com/app/charlesaraya/fb-messenger-app?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=charlesaraya/fb-messenger-app&amp;utm_campaign=Badge_Grade) [![bitHound Overall Score](https://www.bithound.io/github/charlesaraya/fb-messenger-app/badges/score.svg)](https://www.bithound.io/github/charlesaraya/fb-messenger-app)

## Installation

Install the `fb-messenger-app` package in your node server app's local `node_modules` folder.

```bash
npm install --Save fb-messenger-app
```

### How to start

I take for granted that you've already [setup your Messenger Platform app](https://developers.facebook.com/docs/messenger-platform/quickstart):

1. Created a Facebook App and Page
2. Setup the Webhook
3. Got a Page Access Token
4. Subscribed the App to the Page

After installing the fb-messenger-app package with npm as shown above, import it in your app

```js
const MessengerApp = require('fb-messenger-app')
```

Then create a new messenger instance passing your Facebook App page access token (this token will include all messenger permissions)

```js
var messenger = new MessengerApp(MY_PAGE_ACCESS_TOKEN)
```

### Receive Messages

You'll have to listen for _POST_ calls at your webhook. [Callbacks](https://developers.facebook.com/docs/messenger-platform/webhook-reference#format) will be made to this webhook. For this purpose, `_handleCallback` will listen and dispatch each callback type by emitting its corresponding event.

```js
app.post('/webhook', function (req, res) {
  var data = req.body
  messenger._handleCallback(res, data)
})
```

### Send Messages to the user

All messages must be send through the ```sendApiMessage``` method. It'll make POST calls to facebook's Graph API with your app's page access token, and a JSON payload with the 'recipient's id' and the message object to be send. For more information about the payload supported by facebook go ahead an [read more here](https://developers.facebook.com/docs/messenger-platform/send-api-reference).

```js
messenger.sendApiMessage(USER_ID, {text: 'Howdy!'})

var myImage = {
  attachment:
    { 
      type: 'image',
      payload: { 
        url: 'https://petersapparel.com/img/shirt.png'
      }
    }
  }

messenger.sendApiMessage(USER_ID, myImage)
```

### Using callbacks

A successful send API request returns a JSON with the identifier of the user and the message.

```json
{
  "recipient_id": "1008372609250235",
  "message_id": "mid.1456970487936:c34767dfe57ee6e339"
}
```

On the other hand, a when the send API request fails, a JSON is returned with the corresponding error code and message. Messenger Platform errors are grouped by code, with a different message depending on the error condition. [Read more here](https://developers.facebook.com/docs/messenger-platform/send-api-reference#errors)

```json
{
  "error": {
    "message": "Invalid OAuth access token.",
    "type": "OAuthException",
    "code": 190,
    "fbtrace_id": "BLBz/WZt8dN"
  }
}
```

Finally, an example would be the following.

```js
messenger.sendApiMessage(USER_ID, myBrandProducts, function (err, body) {
  if (err) return console.log('Something went wrong: could not send my brand products')
  console.log('Generic message with my brand products where send to %d', USER_ID)
})
```

### Notifications

Optionally, depending on the case, sometimes you'll want to bring the user attention with a normal push. Other times, a silent notification would be enough, and, why not, it would be appropiate not to bother the user at all. We can achieve this by adding the notificationType parameter.

#### Types

If missing, a regular push notification will be sent.

- __REGULAR__ : will emit a sound/vibration and a phone notification
- __SILENT_PUSH__ : will just emit a phone notification
- __NO_PUSH__ : will not emit either

```js
messenger.sendTextMessage(USER_ID, 'Hey! Check this out!', 'REGULAR')
messenger.sendTextMessage(USER_ID, "Check this out, there's no hurry...", 'SILENT_PUSH')
messenger.sendTextMessage(USER_ID, 'If you see this message, check this out', 'NO_PUSH')
```

#### Configure the notification type default

Set the bot's default notification type when instantiating it.

```js
var messenger = new MessengerApp(MY_PAGE_ACCESS_TOKEN, 'SILENT_PUSH')
```

#### Sender Actions

Set typing indicators or send read receipts.

- __mark_seen__ : Mark last message as read
- __typing_on__ : Turn typing indicators on
- __typing_off__ : Turn typing indicators off

```js
messenger.sendSenderActions(USER_ID, 'typing_on')
```

## API

##### Constructor

```js
var messenger = new MessengerApp(token [, options])
```

The following table describes the properties of the 'options' object.

| Property           | Description                                        | Type   | Default  |
| ------------------ |:--------------------------------------------------:|:------:| --------:|
| notificationType   | Determines how messages will be pushed to the user | String | 'REGULAR'    |
| apiUrl             | Facebook's Graph API                               | String | 'https//<i></i>graph.facebook.com/v2.6/'   |

##### Methods

```js
messenger.sendApiMessage(recipient, message [, notificationType] [, cb])

messenger.sendSenderAction(recipient, senderAction [, cb])

messenger.getUserProfile(userId [, cb])

messenger.subscribeApp([cb])

messenger.getUserPsid(tokeb [, cb])

messenger.unlinkAccount(psid [, cb])

messenger.threadSetting.setGreetingText(text [, cb])

messenger.threadSetting.setGetStartedButton(payload [, cb])

messenger.threadSetting.setPersistentMenu(menuItems [, cb])

messenger.threadSetting.deleteGetStartedButton([cb])

messenger.threadSetting.deletePersistentMenu([cb])

messenger.threadSetting.sendSettingRequest(method, params [, cb])

messenger._handleCallback(res, data)

messenger._handleEvent(type, event)
```

## License

### Code

[MIT License](https://github.com/charlesaraya/fb-messenger-app/blob/master/LICENSE).
