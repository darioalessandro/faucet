const express = require("express"),
    app = express(),
    port = process.env.PORT || 3001;

const webRTC = require("wrtc");

app.listen(port);

// Enable cors so that we can call the api from the React UI

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.get("/", function(req, res) {
    res.send("Backend is Alive");
});