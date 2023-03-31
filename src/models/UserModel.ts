/*
 *  UserModel.ts
 *  Project: Shrink-Ray
 *
 *  Author: Carolyn Seglem
 *  Created on: Mar 31, 2023
 */

import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

/**
 * Helper function to control data returned to user
 */
function cleanUserData(user: User): User {
  const cleanedUser = user;
  cleanedUser.passwordHash = undefined;
  cleanedUser.links = undefined;
  return cleanedUser;
}

/**
 * Returns user by its username
 */
async function getUserByUsername(username: string): Promise<User | null> {
  return await userRepository.findOne({ where: { username } });
}

/**
 * Adds a new user entry provided its username and a hashed password
 */
async function addNewUser(username: string, passwordHash: string): Promise<User | null> {
  let newUser = new User();
  newUser.username = username;
  newUser.passwordHash = passwordHash;

  newUser = await userRepository.save(newUser);

  return cleanUserData(newUser);
}

/**
 * Returns user by its id
 */
async function getUserById(userId: string): Promise<User | null> {
  return await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.links', 'links')
    .where('user.userId = :userId', { userId })
    .getOne();
}

export { addNewUser, getUserByUsername, getUserById, cleanUserData };
