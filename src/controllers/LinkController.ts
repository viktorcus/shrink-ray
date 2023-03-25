import { Request, Response } from 'express';
import {
  createLinkId,
  createNewLink,
  getLinkById,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
} from '../models/LinkModel';
import { getUserById } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';

async function shortenUrl(req: Request, res: Response): Promise<void> {
  const { originalUrl } = req.body as NewLinkRequest;
  if (!req.session.isLoggedIn) {
    res.sendStatus(401);
    return;
  }

  const { userId, isAdmin, isPro } = req.session.authenticatedUser;
  const user = await getUserById(userId);
  if (!user) {
    res.sendStatus(404);
    return;
  }

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

async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  const { targetLinkId } = req.params as LinkRedirectRequest;
  const link = await getLinkById(targetLinkId);
  console.log(link);

  if (!link) {
    res.sendStatus(404);
    return;
  }

  updateLinkVisits(link);
  res.redirect(302, link.originalUrl);
}

async function getLinksForTargetUser(req: Request, res: Response): Promise<void> {
  const { targetUserId } = req.params as TargetUserRequest;

  const user = await getUserById(targetUserId);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  try {
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

export default { shortenUrl, getOriginalUrl, getLinksForTargetUser };
