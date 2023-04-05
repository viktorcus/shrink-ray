/*
 *  LinkController.ts
 *  Project: Shrink-Ray
 *
 *  Author: Carolyn Seglem
 *  Created on: Mar 31, 2023
 */

import { Request, Response } from 'express';
import {
  createLinkId,
  createNewLink,
  getLinkById,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
  deleteLinkByLinkId,
} from '../models/LinkModel';
import { getUserById } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';

/**
 * Receives an original url for conversion into shortened url
 */
async function shortenUrl(req: Request, res: Response): Promise<void> {
  const { originalUrl } = req.body as NewLinkRequest;

  // check session login validity
  if (!req.session.isLoggedIn) {
    res.redirect('/login');
    return;
  }

  // check that user exists
  const { userId, isAdmin, isPro } = req.session.authenticatedUser;
  const user = await getUserById(userId);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  // check that number of existing links are within acceptable range (if applicable)
  if (!(isAdmin || isPro) && user.links.length >= 5) {
    res.sendStatus(403);
    return;
  }

  try {
    const linkId = createLinkId(originalUrl, userId);
    const newLink = await createNewLink(originalUrl, linkId, user);
    res.status(201).json(newLink);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

/**
 * Gets the original url associated with a shortened url for redirect
 */
async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  const { targetLinkId } = req.params as LinkRedirectRequest;

  // check that link exists
  const link = await getLinkById(targetLinkId);
  if (!link) {
    res.sendStatus(404);
    return;
  }

  updateLinkVisits(link);
  res.redirect(302, link.originalUrl);
}

/**
 * Returns the links and assocated data for a specified user
 */
async function getLinksForTargetUser(req: Request, res: Response): Promise<void> {
  const { targetUserId } = req.params as TargetUserRequest;

  // check that target user exists
  const user = await getUserById(targetUserId);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  try {
    // check user session to determine what data to return
    if (req.session.isLoggedIn && req.session.authenticatedUser.userId === targetUserId) {
      const links = await getLinksByUserIdForOwnAccount(targetUserId);
      res.json(links);
    } else {
      const links = await getLinksByUserId(targetUserId);
      res.json(links);
    }
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

/**
 * Deletes a link provided its id
 */
async function deleteLink(req: Request, res: Response): Promise<void> {
  const { targetUserId, targetLinkId } = req.params as LinkAndUserRequest;

  // check login validity
  if (!req.session.isLoggedIn) {
    res.sendStatus(401);
    return;
  }

  // check that user has permission to delete
  const { userId, isAdmin } = req.session.authenticatedUser;
  if (!(userId === targetUserId || isAdmin)) {
    res.sendStatus(403);
    return;
  }

  // check that link exists
  const link = await getLinkById(targetLinkId);
  if (!link) {
    res.sendStatus(404);
    return;
  }

  try {
    deleteLinkByLinkId(targetLinkId);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export default { shortenUrl, getOriginalUrl, getLinksForTargetUser, deleteLink };
