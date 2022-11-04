import { Express, Request, Response, NextFunction, request } from 'express';
import ENV from '../../secret';
import url from 'url';
import crypto from 'crypto';

function verifySlackRequest(req: Request, res: Response, next: NextFunction): void {
    let rawRequestBodyString: string
    if(req.method === "POST")
        rawRequestBodyString = JSON.stringify(req.body);
    else 
        rawRequestBodyString = url.parse(req.originalUrl).query
    
    const timestamp: string = req.header('X-Slack-Request-Timestamp')
    const date = new Date()
    const currTime = date.getTime() / 1000

    //console.log(currTime)

    if(Math.abs(currTime - Number(timestamp)) > 5 * 60){
        res.status(401).json({"error": "unverified"})
        return
    }

    const sig_base = `v0:${timestamp}:${rawRequestBodyString}`
    const h = crypto.createHmac('sha256', ENV.SLACK_SIGNING_SECRET)
    h.update(sig_base)
    const my_signature = `v0=${h.digest('hex')}`
    const slack_signature: string = req.header('X-Slack-Signature')

    //console.log(`my_sig:${my_signature};slack_sig:${slack_signature}`)

    if (my_signature.length === slack_signature.length 
        && (crypto.timingSafeEqual(Buffer.from(my_signature), Buffer.from(slack_signature))))
        next()
    else 
        res.status(401).json({"error": "unverified"})
}

export default verifySlackRequest;