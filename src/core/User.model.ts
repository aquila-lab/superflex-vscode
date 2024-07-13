export interface UserData {
  /** @type {Generics.UUID} */
  id: string;
  email: string;
}

class User implements UserData {
  id: string;
  email: string;

  constructor(data: UserData) {
    this.id = data.id;
    this.email = data.email;
  }

  static buildUserDataFromResponse(response: any): UserData {
    return {
      id: response.id,
      email: response.email,
    };
  }
}

export default User;
