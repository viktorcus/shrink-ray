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

export { getLinkById };
