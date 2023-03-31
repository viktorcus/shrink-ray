/*
 *  Link.ts
 *  Project: Shrink-Ray
 *
 *  Author: Carolyn Seglem
 *  Created on: Mar 31, 2023
 */

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Relation,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Link {
  @PrimaryColumn()
  linkId: string;

  @Column()
  originalUrl: string;

  @CreateDateColumn()
  lastAccessedOn: Date;

  @Column()
  numHits: number;

  @ManyToOne(() => User, (user) => user.links)
  @JoinColumn()
  user: Relation<User>;
}
