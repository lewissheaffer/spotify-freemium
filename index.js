import express from 'express'
import { retrieveBaseAccessToken } from './server.js'

const app = express()

retrieveBaseAccessToken(app).then((data) => {
  console.log("in main: " + data);
});