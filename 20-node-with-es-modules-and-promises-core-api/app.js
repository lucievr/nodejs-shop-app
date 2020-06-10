// const express = require('express');
import express from 'express';

// don't forget to add "type": "module" to package.json to be able to use ES module syntax

// const resHandler = require('./response-handler');
import { resHandler } from './response-handler.js';

const app = express();

app.get('/', resHandler);

app.listen(3000);
