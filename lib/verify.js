import crypto from 'crypto'

export function webhook (bot, verifyToken, req, res) {
  if (req.query['hub.verify_token'] === verifyToken) {
    bot.emit('webhook-verified', { result: 'Succesfully verified webhook' })
    return res.send(req.query['hub.challenge'])
  } else {
    bot.emit('error', new Error('Error: Invalid verify token.'))
  }
}

export function signature (bot, appSecret, req, res, buf) {
  const signature = req.headers['x-hub-signature']

  if (!signature) {
    bot.emit('error', new Error("Couldn't validate the request signature."))
  } else {
    let elements = signature.split('=')
    let signatureHash = elements[1]
    let expectedHash = crypto
                        .createHmac('sha1', appSecret)
                        .update(buf)
                        .digest('hex')
    if (signatureHash !== expectedHash) {
      bot.emit('error', new Error("Couldn't validate the request signature."))
    }
    bot.emit('signature-verified', { result: 'Succesfully verified request signature' })
  }
}
