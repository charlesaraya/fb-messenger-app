# node-fb-messenger 
#### NodeJS API adapter for Messenger Platform

## Installation

```bash
npm install fb-messenger-app
```

## API

1. require fb-messenger-app
2. create an instance


##### Constructor
```js
var FBMessenger = require('fb-messenger')
var messenger = new FBMessenger(token[, notificationType])
```

##### Functions
```js
messenger.sendTextMessage(id, stringMessage[, notificationType][, cb])

messenger.sendImageMessage(recipientId, imgUrl[, notificationType][, cb])

messenger.sendAudioMessage(recipientId, audioUrl[, notificationType][, cb])

messenger.sendVideoMessage(recipientId, videoUrl[, notificationType][, cb])

messenger.sendFileMessage(recipientId, fileUrl[, notificationType][, cb])

messenger.sendButtonMessage(recipientId, buttonTemplate, buttons[, notificationType][, cb])

messenger.sendGenericMessage(recipientId, elements[, notificationType][, cb])

messenger.sendReceiptMessage(recipientId, receipt[, notificationType][, cb])

messenger.sendQuickMessage(recipientId, quickReplies[, notificationType][, cb])

messenger.sendItineraryMessage(recipientId, itinerary[, notificationType][, cb])

messenger.sendCheckinMessage(recipientId, checkin[, notificationType][, cb])

messenger.sendBoardingpassMessage(recipientId, boardingpass[, notificationType][, cb])

messenger.sendFlightupdateMessage(recipientId, flightupdate[, notificationType][, cb])

messenger.sendApiMessage(recipientId, message[, notificationType][, cb])

messenger.sendSenderAction(recipientId, senderAction[, cb])

messenger.setGreetingText(message[, cb])

messenger.setGetStartedButton(message[, cb])

messenger.deleteGetStartedButton([cb])

messenger.setPersistentMenu(items[, cb])

messenger.deletePersistentMenu([cb])

messenger.sendThreadSettingsRequest([cb])

messenger.getUserProfile(userId[, cb])
```

##### Notification Types
Notification Types are optional; by default, messages will be _REGULAR_ push notification type
 - REGULAR : will emit a sound/vibration and a phone notification
 - SILENT_PUSH : will just emit a phone notification
 - NO_PUSH : will not emit either

##### Sender Actions
Set typing indicators or send read receipts.
- mark_seen : Mark last message as read
- typing_on : Turn typing indicators on
- typing_off : Turn typing indicators off

## Examples

### Basic Example

```js
TODO
```

### Callback Example

```js
TODO
```

### No push Example

```js
TODO
```

### Default to silent push Example

```js
TODO
```

### Complete Example

```js
TODO
```