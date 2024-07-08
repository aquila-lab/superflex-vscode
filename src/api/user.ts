import { Api } from "./api";
import { parseError } from "./error";
import User, { UserData } from "../core/User.model";

async function getUserInfo(): Promise<UserData> {
  try {
    const { data } = await Api.get("/userinfo");
    return Promise.resolve(User.buildUserDataFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { getUserInfo };
