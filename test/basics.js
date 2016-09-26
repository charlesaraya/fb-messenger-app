'use strict'

const mocha = require('mocha')
const expect = require('chai').expect
const Messenger = require('../bin/app').default

describe('Bot', function () {
  let dummyToken = 'foo'

  describe('#initialization', function () {
    describe('#basics', function () {
      let bot = new Messenger(dummyToken)
      let goodBot = function () { return bot }
      let EventEmitter = require('events').EventEmitter

      it('should initialize without throwing errors', function () {
        expect(goodBot).to.not.throw(Error)
      })
      it('should initialize correctly', function () {
        expect(bot).to.exist
      })
      it('should extend from EventEmitter', function () {
        expect(bot).to.be.an.instanceof(EventEmitter)
      })
    })

    describe('#public properties', function () {
      let bot = new Messenger(dummyToken)
      let ThreadSetting = require('../bin/thread').default
      let SenderAction = require('../bin/sender-action').default

      it('should store threadSetting object', function () {
        expect(bot.threadSetting).to.exist;
        expect(bot.threadSetting).to.be.an.instanceof(ThreadSetting);
      })
      it('should store senderAction object', function () {
        expect(bot.senderAction).to.exist;
        expect(bot.senderAction).to.be.an.instanceof(SenderAction);
      })
      it('should store verify object', function () {
        expect(bot.verify).to.exist;
        expect(bot.verify).to.be.an('object');
      })
    })

    describe('#private methods', function () {
      let bot = new Messenger(dummyToken)

      it('should have a getToken function', function () {
        expect(bot.getToken).to.exist;
        expect(bot.getToken).to.be.a('function');
      })
      it('should have a getApiUrl function', function () {
        expect(bot.getApiUrl).to.exist;
        expect(bot.getApiUrl).to.be.a('function');
      })
      it('should have a getNotificationType function', function () {
        expect(bot.getNotificationType).to.exist;
        expect(bot.getNotificationType).to.be.a('function');
      })
      it('should have a sendApiMessage function', function () {
        expect(bot.sendApiMessage).to.exist;
        expect(bot.sendApiMessage).to.be.a('function');
      })
      it('should have a subscribeApp function', function () {
        expect(bot.subscribeApp).to.exist;
        expect(bot.subscribeApp).to.be.a('function');
      })
      it('should have a getUserPsid function', function () {
        expect(bot.getUserPsid).to.exist;
        expect(bot.getUserPsid).to.be.a('function');
      })
      it('should have a unlinkAccount function', function () {
        expect(bot.unlinkAccount).to.exist;
        expect(bot.unlinkAccount).to.be.a('function');
      })
      it('should have a getUserProfile function', function () {
        expect(bot.getUserProfile).to.exist;
        expect(bot.getUserProfile).to.be.a('function');
      })
      it('should have a _handleCallback function', function () {
        expect(bot._handleCallback).to.exist;
        expect(bot._handleCallback).to.be.a('function');
      })
      it('should have a _handleEvent function', function () {
        expect(bot._handleEvent).to.exist;
        expect(bot._handleEvent).to.be.a('function');
      })
      it('should have a threadSetting.setGreetingText function', function () {
        expect(bot.threadSetting.setGreetingText).to.exist;
        expect(bot.threadSetting.setGreetingText).to.be.a('function');
      })
      it('should have a threadSetting.setGetStartedButton function', function () {
        expect(bot.threadSetting.setGetStartedButton).to.exist;
        expect(bot.threadSetting.setGetStartedButton).to.be.a('function');
      })
      it('should have a threadSetting.setPersistentMenu function', function () {
        expect(bot.threadSetting.setPersistentMenu).to.exist;
        expect(bot.threadSetting.setPersistentMenu).to.be.a('function');
      })
      it('should have a threadSetting.deleteGetStartedButton function', function () {
        expect(bot.threadSetting.deleteGetStartedButton).to.exist;
        expect(bot.threadSetting.deleteGetStartedButton).to.be.a('function');
      })
      it('should have a threadSetting.deletePersistentMenu function', function () {
        expect(bot.threadSetting.deletePersistentMenu).to.exist;
        expect(bot.threadSetting.deletePersistentMenu).to.be.a('function');
      })
      it('should have a threadSetting.sendSettingRequest function', function () {
        expect(bot.threadSetting.sendSettingRequest).to.exist;
        expect(bot.threadSetting.sendSettingRequest).to.be.a('function');
      })
      it('should have a verify.webhook function', function () {
        expect(bot.verify.webhook).to.exist;
        expect(bot.verify.webhook).to.be.a('function');
      })
      it('should have a verify.signature function', function () {
        expect(bot.verify.signature).to.exist;
        expect(bot.verify.signature).to.be.a('function');
      })
    })

    describe('#arguments', function () {
      let token = 'foo'

      it('should throw an Error when token is missing', function () {
        let badBot = function () { bot = new Messenger() }
        expect(badBot).to.throw(Error, 'Facebook Page access token is missing.')
      })

      it('should store a token of type string', function () {
        let bot = new Messenger(token)

        expect(bot.getToken()).to.be.a('string')
      })

      it('should store "https://graph.facebook.com/v2.6/" in apiUrl in case it was not passed as option', function () {
        let bot = new Messenger(token)

        expect(bot.getApiUrl()).to.equal('https://graph.facebook.com/v2.6/')
      })

      it('should store an optional apiUrl correctly', function () {
        let options = {apiUrl: 'foo'}
        let bot = new Messenger(token, options)

        expect(bot.getApiUrl()).to.equal('foo')
      })

      it('should store "REGULAR" in notif.Type if no optional notif.Type was passed', function () {
        let bot = new Messenger(token)

        expect(bot.getNotificationType()).to.equal('REGULAR')
      })
      it('should store "REGULAR" in notif.Type if the optional notif.Type isn\'t supported', function () {
        let options = {notificationType: 'UNSUPPORTED_NOTIFICATION_TYPE'}
        let bot = new Messenger(token, options)

        expect(bot.getNotificationType()).to.equal('REGULAR')
      })

      it('should store "REGULAR" in notificationType if passed as an option', function () {
        let options = {notificationType: 'REGULAR'}
        let bot = new Messenger(token, options)

        expect(bot.getNotificationType()).to.equal('REGULAR')
      })

      it('should store "SILENT_PUSH" in notificationType if passed as an option', function () {
        let options = {notificationType: 'SILENT_PUSH'}
        let bot = new Messenger(token, options)

        expect(bot.getNotificationType()).to.equal('SILENT_PUSH')
      })

      it('should store "NO_PUSH" in notificationType if passed as an option', function () {
        let options = {notificationType: 'NO_PUSH'}
        let bot = new Messenger(token, options)

        expect(bot.getNotificationType()).to.equal('NO_PUSH')
      })
    })
  })
})
