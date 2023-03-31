/*
 *  index.ts
 *  Project: Shrink-Ray
 *
 *  Author: Carolyn Seglem
 *  Created on: Mar 31, 2023
 */

import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import UserController from './controllers/UserController';
import LinkController from './controllers/LinkController';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: COOKIE_SECRET as string,
    cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
    name: 'session',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(express.json());

app.post('/api/users', UserController.registerUser);
app.post('/api/login', UserController.logIn);
app.post('/api/links', LinkController.shortenUrl);
app.get('/api/users/:targetUserId/links', LinkController.getLinksForTargetUser);
app.delete('/api/users/:targetUserId/links/:targetLinkId', LinkController.deleteLink);
app.get('/:targetLinkId', LinkController.getOriginalUrl);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
