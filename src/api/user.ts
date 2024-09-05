import { Api } from "./api";
import { parseError } from "./error";
import { buildUserFromResponse, User } from "../core/User.model";

async function getUserInfo(): Promise<User> {
  try {
    const { data } = await Api.get("/user");
    return Promise.resolve(buildUserFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { getUserInfo };
