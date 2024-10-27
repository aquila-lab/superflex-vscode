import { User, UserSubscription } from "../../shared/model";

import { Api } from "./api";
import { parseError } from "./error";
import { buildUserFromResponse, buildUserSubscriptionFromResponse } from "./transformers";

async function getUserInfo(): Promise<User> {
  try {
    const { data } = await Api.get("/user");
    return Promise.resolve(buildUserFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

async function getUserSubscription(): Promise<UserSubscription> {
  try {
    const { data } = await Api.get("/billing/subscription");
    return Promise.resolve(buildUserSubscriptionFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { getUserInfo, getUserSubscription };
