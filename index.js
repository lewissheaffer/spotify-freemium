"use strict";

import 'dotenv/config'
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;
const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const redirect_uri = `${process.env.root_url}/callback`;

app.get('/', function(req, res) {
  res.sendFile(path.join(path.resolve(), './public/authSuccess.html'))
});

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  var scope = 'user-modify-playback-state';

  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }).toString());
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  if (state === null) {
    res.redirect('/#' +
      new URLSearchParams({
        error: 'state_mismatch'
      }).toString);
  } else {
    var authOptions = {
      method:'POST',
      body: new URLSearchParams({
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": 'authorization_code'
      }).toString(),
      headers: {
        "Authorization": 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
        "Content-Type": "application/x-www-form-urlencoded"
      },
    };

    fetch("https://accounts.spotify.com/api/token", authOptions)
      .then((response) => response.text())
      .then(data=>{console.log(data)})
      res.redirect("/")
  }
});

// app.get('/refresh_token', function(req, res) {

//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });

app.listen(port);

function generateRandomString(length) {
  var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < length; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}