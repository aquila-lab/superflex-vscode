import axios from "axios";

import User, { UserData } from "../core/User.model";
import { parseError } from "./error";

const Api = axios.create({ baseURL: "https://api.figma.com/v1" });

async function getFigmaUserInfo(token: string): Promise<UserData> {
  try {
    const { data } = await Api.get("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return Promise.resolve(User.buildUserDataFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { getFigmaUserInfo };
