import Express from 'express';
import verifySlackRequest from './util/verifySlackRequest';

const PORT = process.env.PORT || 5000;
const app = Express();

app.use(Express.json());

interface ApiDescription {
    name: string,
    version: string,
    description: string,
    routes: {url: string, credentials: string}[]
}

const apiDescription: ApiDescription = {
    name: "group-slack-bot",
    version: "v0.1",
    description: "Bot for any Slack server for automatic grouping and queuing of members",
    routes: [],
}

app.get('/api', (req, res) => {
    res.json(apiDescription);
})



interface EventResponse {

}

app.post('/api/action', verifySlackRequest, (req, res) => {
    console.log(req.body)
    try {
        if(req.body.type == "url_verification")
            res.send(req.body.challenge)
        else
            res.status(200).json({})
    } catch (error) {
        console.log(error)
        res.status(400).json({"error": "invalid request"})
    }
})

app.listen(PORT, () => {
    return console.log(`Express is listening at http://localhost:${PORT}`);
});