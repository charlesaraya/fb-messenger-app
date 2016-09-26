import crypto from 'crypto'

export function webhook (verifyToken, req, res) {
  if (req.query['hub.verify_token'] === verifyToken) {
    this.emit('webhook-verified', { result: 'Succesfully verified webhook' })
    return res.send(req.query['hub.challenge'])
  } else {
    this.emit('error', new Error('Error: Invalid verify token.'))
  }
}

export function signature (appSecret, req, res, buf) {
  const signature = req.headers['x-hub-signature']

  if (!signature) {
    this.emit('error', new Error("Couldn't validate the request signature."))
  } else {
    let elements = signature.split('=')
    let signatureHash = elements[1]
    let expectedHash = crypto
                        .createHmac('sha1', appSecret)
                        .update(buf)
                        .digest('hex')
    if (signatureHash !== expectedHash) {
      this.emit('error', new Error("Couldn't validate the request signature."))
    }
    this.emit('signature-verified', { result: 'Succesfully verified request signature' })
  }
}
