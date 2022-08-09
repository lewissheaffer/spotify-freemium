'use strict'

import 'dotenv/config'
import fetch from 'node-fetch'
import path from 'path'
import open from 'open'
import session from 'express-session'

const port = process.env.PORT || 8080
const client_id = process.env.client_id
const client_secret = process.env.client_secret
const redirect_uri = `${process.env.root_url}/callback`

/**
 * Retrieves the user's access token  
 * @param {*} app 
 */
export const retrieveBaseAccessToken = async (app) => {
    return (new Promise(resolve => {
        app.use(session({secret: generateRandomString(32), access_token:null, refresh_token:null}));

        app.get('/', function(req, res) {
            res.sendFile(path.join(path.resolve(), './public/authSuccess.html'))
            console.log("in the method: " + req.session.access_token);
            if(server) {
                console.log("closing server");
                server.close(() => {
                    resolve(req.session.access_token);
                })
            }
        })
    
        app.get('/login', function(req, res) {
            var state = generateRandomString(16)
            var scope = 'user-modify-playback-state'
            res.redirect('https://accounts.spotify.com/authorize?' +
                new URLSearchParams({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state
            }).toString())
        })
    
        app.get('/callback', function(req, res) {
            var code = req.query.code || null
            var state = req.query.state || null
            if (state === null) {
                res.redirect('/#' +
                new URLSearchParams({
                    error: 'state_mismatch'
                }).toString)
            } else {
                var authOptions = {
                    method:'POST',
                    body: new URLSearchParams({
                        'code': code,
                        'redirect_uri': redirect_uri,
                        'grant_type': 'authorization_code'
                    }).toString(),
                    headers: {
                        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
    
                fetch('https://accounts.spotify.com/api/token', authOptions)
                .then((response) => response.json())
                .then(data=>{
                    req.session.access_token = data.access_token;
                    req.session.refresh_token = data.refresh_token;
                    res.redirect('/')
                })
            }
        })

        const server = app.listen(port)
        open(`${process.env.root_url}/login`);
    })) 
}

const refreshAccessToken = () => {
    var refresh_token = req.query.refresh_token
    var authOptions = {
        method:'POST',
        body: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id:client_id,
        },
        headers: { 
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }

    fetch('https://accounts.spotify.com/api/token', authOptions)
    .then((response) => {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token
            
            res.send({
                'access_token': access_token
            })
        }
    })
}


const generateRandomString = (length) => {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var randomString = ''
    for (var i = 0; i < length; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length)
        randomString += charSet.substring(randomPoz,randomPoz+1)
    }
    return randomString
}
