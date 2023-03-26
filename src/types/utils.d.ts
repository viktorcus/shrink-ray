type DatabaseConstraintError = {
  type: 'unique' | 'check' | 'not null' | 'foreign key' | 'unknown';
  columnName?: string;
  message?: string;
};

type NewUserRequest = {
  username: string;
  password: string;
};

type NewLinkRequest = {
  originalUrl: string;
};

type LinkRedirectRequest = {
  targetLinkId: string;
};

type TargetUserRequest = {
  targetUserId: string;
};

type LinkAndUserRequest = {
  targetLinkId: string;
  targetUserId: string;
};
