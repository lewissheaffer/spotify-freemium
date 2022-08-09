import { retrieveBaseAccessTokenPayload,refreshAccessToken } from './server.js'

let access_token = null;
let refresh_token = null;

let intial_access_payload = await retrieveBaseAccessTokenPayload();
access_token = intial_access_payload.access_token
refresh_token = intial_access_payload.refresh_token
console.log("Access Token: " + access_token);

//verify refresh works
access_token = await refreshAccessToken(refresh_token);
console.log("New Access Token: " + access_token);
