export type User = {
  /** @type {Generics.UUID} */
  id: string;
  email: string;
  username: string;
  picture?: string | null;
};
