import { createHash } from 'crypto';
import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';

const linkRepository = AppDataSource.getRepository(Link);

async function getLinkById(userId: string): Promise<Link | null> {
  return await linkRepository
    .createQueryBuilder('link')
    .leftJoinAndSelect('link.user', 'link')
    .where('user.userId = :userId', { userId })
    .getOne();
}

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(originalUrl + userId);
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(9);

  return linkId;
}

export { getLinkById, createLinkId };
