import Express from 'express';

const PORT = 5000;

const app = Express();

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
};

app.get('/api', (req, res) => {
    res.json(apiDescription);
})

app.listen(PORT, () => {
    return console.log(`Express is listening at http://localhost:${PORT}`);
});