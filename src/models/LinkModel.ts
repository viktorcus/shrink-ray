/*
 *  LinkModel.ts
 *  Project: Shrink-Ray
 *
 *  Author: Carolyn Seglem
 *  Created on: Mar 31, 2023
 */

import { createHash } from 'crypto';
import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';
import { User } from '../entities/User';
import { cleanUserData } from './UserModel';

const linkRepository = AppDataSource.getRepository(Link);

/**
 * Uses md5 to generate a unique shortened link
 */
function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(originalUrl + userId);
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(9);

  return linkId;
}

/**
 * Returns link by its id
 */
async function getLinkById(linkId: string): Promise<Link | null> {
  return await linkRepository
    .createQueryBuilder('link')
    .leftJoinAndSelect('link.user', 'user')
    .where('link.linkId = :linkId', { linkId })
    .select(['link', 'user.userId', 'user.username', 'user.isAdmin', 'user.isPro'])
    .getOne();
}

/**
 * Creates a Link table entry provided an original and shortened url
 */
async function createNewLink(originalUrl: string, linkId: string, creator: User): Promise<Link> {
  let link = new Link();
  link.originalUrl = originalUrl;
  link.linkId = linkId;
  link.user = creator;
  link.numHits = 0;
  link = await linkRepository.save(link);

  link.user = cleanUserData(link.user);
  return link;
}

/**
 * Increments number of link hits
 */
async function updateLinkVisits(link: Link): Promise<Link> {
  const updatedLink = link;
  updatedLink.numHits += 1;
  updatedLink.lastAccessedOn = new Date();
  return await linkRepository.save(updatedLink);
}

/**
 * Returns links by their user's id with limited data (for use by other users)
 */
async function getLinksByUserId(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select(['link.linkId', 'link.originalUrl', 'user.userId', 'user.username', 'user.isAdmin'])
    .getMany();

  return links;
}

/**
 * Returns links by their user's id with greater data (for use by admins/own account)
 */
async function getLinksByUserIdForOwnAccount(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select(['link', 'user.userId', 'user.username', 'user.isAdmin', 'user.isPro'])
    .getMany();

  return links;
}

/**
 * Deletes the link with the provided id
 */
async function deleteLinkByLinkId(linkId: string): Promise<void> {
  await linkRepository
    .createQueryBuilder('link')
    .delete()
    .where('linkId = :linkId', { linkId })
    .execute();
}

export {
  getLinkById,
  createNewLink,
  createLinkId,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
  deleteLinkByLinkId,
};
