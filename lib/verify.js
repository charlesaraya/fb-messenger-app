import crypto from 'crypto'

export function webhook (verifyToken, req, res) {
  console.log('Verifying Webhook...')

  if (req.query['hub.verify_token'] === verifyToken) {
    console.log('Ok: Webhook Verified.')
    return res.send(req.query['hub.challenge'])
  } else {
    return res.send('Error: Invalid verify token.')
  }
}

export function signature (appSecret, req, res, buf) {
  const signature = req.headers['x-hub-signature']

  if (!signature) {
    throw new Error("Couldn't validate the request signature.")
  } else {
    let elements = signature.split('=')
    let signatureHash = elements[1]
    let expectedHash = crypto
                        .createHmac('sha1', appSecret)
                        .update(buf)
                        .digest('hex')

    if (signatureHash !== expectedHash) {
      throw new Error("Couldn't validate the request signature.")
    }
  }
}
