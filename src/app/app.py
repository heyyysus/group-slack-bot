from flask import Flask
from flask import request
from flask import Response
import hmac
import hashlib
import time
app = Flask(__name__)

PRODUCTION = False
SLACK_SIGNING_SECRET = '1e98a69d7dae9db3d6cbfbecea30e8fa'

def verify_request(request):
    params = request.get_json()
    token = params['token']
    challenge = params['challenge']
    type = params['type']
    body = request.data.decode('utf-8')
    timestamp = request.headers.get('X-Slack-Request-Timestamp')

    if abs(time.time() - float(timestamp)) > 60 * 5 and PRODUCTION:
        # The request timestamp is more than five minutes from local time.
        # It could be a replay attack, so let's ignore it.
        return {"error": "invalid timestamp"}, 400
    
    app.logger.warning("request.body=%s", body)

    sig_base_str = "{}:{}:{}".format('v0', timestamp, body)
    h = hmac.new(bytes(SLACK_SIGNING_SECRET, 'UTF-8'), sig_base_str.encode(), hashlib.sha256 )

    my_signature = "v0={}".format(h.hexdigest())
    slack_signature = request.headers.get('X-Slack-Signature')

    if hmac.compare_digest(my_signature, slack_signature):
        return True
    else:
        return False

@app.route('/')
def index():
    return { 'response': 'success' }

@app.route('/api/action', methods = ['POST'])
def action_event():
    if request.method == 'POST':
        try:
            verified = verify_request(request)
            if verified:
                app.logger.warning("VERIFIED")
                return request.get_json()['challlenge']
            else:
                return "Unverified"
        except Exception as err:
            app.logger.error("error: %s", err)
            return {"error": "bad request"}, 400

if __name__ == "__main__":
    app.run(debug=True)