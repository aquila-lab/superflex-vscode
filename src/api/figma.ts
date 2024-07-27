import User, { UserData } from "../core/User.model";
import { FigmaTokenInformation } from "../core/Figma.model";
import { PublicApi } from "./api";
import { FigmaApi } from "./figmaApi";
import { parseError } from "./error";

type FigmaRefreshAccessTokenArgs = {
  refreshToken: string;
};

async function figmaRefreshAccessToken({ refreshToken }: FigmaRefreshAccessTokenArgs): Promise<FigmaTokenInformation> {
  try {
    const res = await PublicApi.post("/auth/figma-refresh-token", {
      refresh_token: refreshToken,
    });

    return Promise.resolve({
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      expiresIn: res.data.expires_in,
    });
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

async function getFigmaUserInfo(): Promise<UserData> {
  try {
    const { data } = await FigmaApi.get("/me");
    return Promise.resolve(User.buildUserDataFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { figmaRefreshAccessToken, getFigmaUserInfo };
