/*
 *  express-session.d.ts
 *  Project: Shrink-Ray
 *
 *  Author: Carolyn Seglem
 *  Created on: Mar 31, 2023
 */

import 'express-session';

declare module 'express-session' {
  export interface Session {
    clearSession(): Promise<void>; // DO NOT MODIFY THIS!

    authenticatedUser: {
      userId: string;
      username: string;
      isPro: boolean;
      isAdmin: boolean;
    };
    isLoggedIn: boolean;
  }
}
