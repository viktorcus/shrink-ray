import { createHash } from 'crypto';
import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';
import { User } from '../entities/User';
import { cleanUserData } from './UserModel';

const linkRepository = AppDataSource.getRepository(Link);

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(originalUrl + userId);
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(9);

  return linkId;
}

async function getLinkById(linkId: string): Promise<Link | null> {
  return await linkRepository
    .createQueryBuilder('link')
    .leftJoinAndSelect('link.user', 'user')
    .where('link.linkId = :linkId', { linkId })
    .select(['link', 'user.userId', 'user.username', 'user.isAdmin', 'user.isPro'])
    .getOne();
}

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

async function updateLinkVisits(link: Link): Promise<Link> {
  const updatedLink = link;
  updatedLink.numHits += 1;
  updatedLink.lastAccessedOn = new Date();
  return await linkRepository.save(updatedLink);
}

async function getLinksByUserId(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select(['link.linkId', 'link.originalUrl', 'user.userId', 'user.username', 'user.isAdmin'])
    .getMany();

  return links;
}

async function getLinksByUserIdForOwnAccount(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select(['link', 'user.userId', 'user.username', 'user.isAdmin', 'user.isPro'])
    .getMany();

  return links;
}

export {
  getLinkById,
  createNewLink,
  createLinkId,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
};
