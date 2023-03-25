import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

function cleanUserData(user: User): User {
  const cleanedUser = user;
  cleanedUser.passwordHash = undefined;
  cleanedUser.links = undefined;
  return cleanedUser;
}

async function getUserByUsername(username: string): Promise<User | null> {
  return await userRepository.findOne({ where: { username } });
}

async function addNewUser(username: string, passwordHash: string): Promise<User | null> {
  let newUser = new User();
  newUser.username = username;
  newUser.passwordHash = passwordHash;

  newUser = await userRepository.save(newUser);

  return cleanUserData(newUser);
}

async function getUserById(userId: string): Promise<User | null> {
  return await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.links', 'links')
    .where('user.userId = :userId', { userId })
    .getOne();
}

export { addNewUser, getUserByUsername, getUserById, cleanUserData };
