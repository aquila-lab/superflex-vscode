export type User = {
  /** @type {Generics.UUID} */
  id: string;
  email: string;
};

export function buildUserFromResponse(res: any): User {
  return {
    id: res.id,
    email: res.email,
  };
}
