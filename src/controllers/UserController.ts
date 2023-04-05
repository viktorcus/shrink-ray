/*
 *  UserController.ts
 *  Project: Shrink-Ray
 *
 *  Author: Carolyn Seglem
 *  Created on: Mar 31, 2023
 */

import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { addNewUser, getUserByUsername } from '../models/UserModel';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as NewUserRequest;

  // check that user does not already exist (no conflict)
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    res.sendStatus(409);
    return;
  }

  // generate user's password hash
  const passwordHash = await argon2.hash(password);
  try {
    await addNewUser(username, passwordHash);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as NewUserRequest;
  const user = await getUserByUsername(username);

  // check that user exists
  if (!user) {
    res.sendStatus(404);
    return;
  }
  // check password match
  const { passwordHash } = user;
  if (!(await argon2.verify(passwordHash, password))) {
    res.sendStatus(403);
    return;
  }

  // update session data
  await req.session.clearSession();
  req.session.authenticatedUser = {
    userId: user.userId,
    username: user.username,
    isPro: user.isPro,
    isAdmin: user.isAdmin,
  };
  req.session.isLoggedIn = true;

  res.redirect('/shrink');
}

export default { registerUser, logIn };
