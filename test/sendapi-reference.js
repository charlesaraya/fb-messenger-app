'use strict'

const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const nock = require('nock')
const Messenger = require('../bin/app').default

let bot = new Messenger('foo')
let recipientId = '1008372609250235'
let response = {
  recipient_id: '1008372609250235',
  message_id: 'mid.1456970487936:c34767dfe57ee6e339'
}
let payload = { recipient: { id: recipientId } }
let error = {
  type: 'OAuthException',
  fbtrace_id: 'D82VFaCmOvc'
}
describe('Send API Reference', function () {
  describe('#Basics', function () {
    it('should subscribe the app to get updates for a page correctly', function () {
      let response = {
        success: true
      }

      nock('https://graph.facebook.com')
        .post('/v2.6/me/subscribed_apps', true)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.subscribeApp((err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should link account and get the user PSID correctly', function () {
      let response = {
        id: 264398360602020,
        recipient: 1086521361422982
      }

      nock('https://graph.facebook.com')
        .get('/v2.6/me/subscribed_apps', true)
        .query({
          access_token: 'foo',
          fields: 'recipient',
          account_linking_token: 'ACCOUNT_LINKING_TOKEN'
        })
        .reply(200, response)

      bot.getUserPsid('foo', (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should unlink account correctly', function () {
      let response = { result: 'unlink account success' }
      let payload = { psid: 1086521361422982 }

      nock('https://graph.facebook.com')
        .post('/v2.6/me/unlink_accounts', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.unlinkAccount('foo', (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should get the user profile correctly', function () {
      let response = {
        first_name: 'Peter',
        last_name: 'Chang',
        profile_pic: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/p200x200/13055603_10105219398495383_8237637584159975445_n.jpg?oh=1d241d4b6d4dac50eaf9bb73288ea192&oe=57AF5C03&__gda__=1470213755_ab17c8c8e3a0a447fed3f272fa2179ce',
        locale: 'en_US',
        timezone: -7,
        gender: 'male'
      }

      nock('https://graph.facebook.com')
        .get('/v2.6/' + recipientId, true)
        .query({
          access_token: 'foo',
          fields: 'first_name,last_name,profile_pic,locale,timezone,gender'
        })
        .reply(200, response)

      bot.getUserProfile(recipientId, (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should get the user profile incorrectly', function () {
      let badUserId = '24323454343534543'
      error.message = 'Unsupported get request. Object with ID \'432421341324\' does not exist, cannot be loaded due to missing permissions, or does not support this operation. Please read the Graph API documentation at https://developers.facebook.com/docs/graph-api'
      error.code = 100

      nock('https://graph.facebook.com')
        .get('/v2.6/' + badUserId, true)
        .query({
          access_token: 'foo',
          fields: 'first_name,last_name,profile_pic,locale,timezone,gender'
        })
        .reply(200, error)

      bot.getUserProfile(badUserId, (err, body) => {
        expect(body).to.be.undefined
        expect(err).to.equal(error)
      })
    })
  })

  describe('#Sender Actions', function () {
    it('should send a mark_seen sender action correctly', function () {
      payload.sender_action = 'mark_seen'

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.senderAction.sendSenderActionRequest(recipientId, 'mark_seen', (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should send a typing_on sender action correctly', function () {
      payload.sender_action = 'typing_on'

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.senderAction.sendSenderActionRequest(recipientId, 'typing_on', (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should send a typing_off sender action correctly', function () {
      payload.sender_action = 'typing_off'

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.senderAction.sendSenderActionRequest(recipientId, 'typing_off', (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should return error if sender action type is unsupported', function () {
      payload.sender_action = 'unsupported'
      error.message = '(#100) Param sender_action must be one of {MARK_SEEN, TYPING_ON, TYPING_OFF}'
      error.code = 100

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, error)

      bot.senderAction.sendSenderActionRequest(recipientId, 'unsupported', (err, body) => {
        expect(err).to.equal(error)
        expect(body).to.be(undefined)
      })
    })
  })

  describe('#Text Message', function () {
    it('should send a text message correctly', function () {
      payload.message = { text: 'Hello World!' }

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.sendApiMessage(recipientId, { text: 'Hello World!' }, (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should send a text message over 320 characters and fail', function () {
      payload.message = { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec aliquam cursus augue, a placerat felis hendrerit vitae. Quisque pellentesque risus tempus ex vulputate eleifend. Duis vitae finibus tortor. Sed scelerisque malesuada finibus. Cras sed posuere nulla, quis consectetur sapien. Nullam vitae fermentum sapien susp' }
      error.message = '(#100) Length of param message[text] must be less than or equal to 320'
      error.code = 100

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, error)

      bot.sendApiMessage(recipientId, { text: 'Hello World!' }, (err, body) => {
        expect(body).to.be.undefined
        expect(err).to.equal(error)
      })
    })

    it('should send a message with text and attachment and fail', function () {
      payload.message = {
        text: 'this is text',
        attachment: {
          type: 'image',
          payload: {
            url: 'https://myweb.com/image.png'
          }
        }
      }
      error.message = '(#100) Only one of text or attachment can be specified'
      error.code = 100

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, error)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(body).to.be.undefined
        expect(err).to.equal(error)
      })
    })
  })

  describe('#Image Message', function () {
    it('should send an image attachment message correctly', function () {
      payload.message = {
        attachment: {
          type: 'image',
          payload: {
            url: 'https://myweb.com/image.png'
          }
        }
      }

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should send an unsupported image and fail', function () {
      payload.message = {
        attachment: {
          type: 'image',
          payload: {
            url: 'http://myweb.com/image.svg'
          }
        }
      }
      error.message = '(#546) The type of file you\'re trying to attach isn\'t allowed. Please try again with a different format.'
      error.code = 546

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, error)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(body).to.be.undefined
        expect(err).to.equal(error)
      })
    })

    it('should send a non fetchable image and fail', function () {
      payload.message = {
        attachment: {
          type: 'image',
          payload: {
            url: 'http://myweb.com/no_exist.png'
          }
        }
      }
      error.message = '(#100) Failed to fetch the file from the url'
      error.code = 100

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, error)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(body).to.be.undefined
        expect(err).to.equal(error)
      })
    })
  })

  describe('#Audio Message', function () {
    it('should send an audio attachment message correctly', function () {
      payload.message = {
        attachment: {
          type: 'audio',
          payload: {
            url: 'https://myweb.com/audio.mp3'
          }
        }
      }

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })

    it('should send an audio over 10MB and fail', function () {
      payload.message = {
        attachment: {
          type: 'audio',
          payload: {
            url: 'http://myweb.org/audio_over_10MB.mp3'
          }
        }
      }
      error.message = '(#100) Failed to fetch the file from the url'
      error.code = 100

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, error)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(body).to.be.undefined
        expect(err).to.equal(error)
      })
    })
  })

  describe('#Video Message', function () {
    it('should send a video attachment message correctly', function () {
      payload.message = {
        attachment: {
          type: 'video',
          payload: {
            url: 'https://myweb.com/video.mp4'
          }
        }
      }

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })
  })

  describe('#File Message', function () {
    it('should send a file attachment message correctly', function () {
      payload.message = {
        attachment: {
          type: 'file',
          payload: {
            url: 'https://myweb.com/article.pdf'
          }
        }
      }

      nock('https://graph.facebook.com')
        .post('/v2.6/me/messages', payload)
        .query({
          access_token: 'foo'
        })
        .reply(200, response)

      bot.sendApiMessage(recipientId, payload.message, (err, body) => {
        expect(err).to.be.null
        expect(body).to.equal(response)
      })
    })
  })
})
