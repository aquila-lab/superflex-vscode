export type User = {
  /** @type {Generics.UUID} */
  id: string;
  email: string;
  username: string;
  picture?: string | null;
};

export type Plan = {
  name: string;
  basicRequestLimit: number;
  premiumRequestLimit: number;
};

export type UserSubscription = {
  plan: Plan | null;
  basicRequestsUsed: number;
  premiumRequestsUsed: number;
  lastResetDate: Date;
  createdAt: Date;
};
