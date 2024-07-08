import * as vscode from "vscode";

import { ApiProvider } from "../api";
import { ApiErrorTypes } from "../common/constants";
import ElementAIAuthenticationProvider, { AUTH_PROVIDER_ID } from "../authentication/ElementAIAuthenticationProvider";

async function signIn(provider: ElementAIAuthenticationProvider): Promise<void> {
  const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: true });
  setAuthHeader(session.accessToken, () => signOut(provider));
  vscode.window.showInformationMessage(`Signed in as ${session.account.label} 🎉`);
}

async function signOut(provider: ElementAIAuthenticationProvider): Promise<void> {
  const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: false });
  if (session) {
    await provider.removeSession(session.id);
  }

  ApiProvider.setHeader("Authorization", null);
  ApiProvider.removeResponseInterceptor();

  vscode.window.showInformationMessage("Signed out!");
}

/**
 * We need to authenticate the user on extension activation to ensure that the user is authenticated before making any API calls.
 * @param provider
 * @returns
 */
async function authenticate(provider: ElementAIAuthenticationProvider, accessToken?: string): Promise<void> {
  if (accessToken) {
    setAuthHeader(accessToken, () => signOut(provider));
    return;
  }

  const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: false });
  if (!session) {
    return;
  }

  setAuthHeader(session.accessToken, () => signOut(provider));
}

async function setAuthHeader(token: string, logoutAction: any): Promise<void> {
  try {
    ApiProvider.setHeader("Authorization", `Bearer ${token}`);
    ApiProvider.addHeaderTokenInterceptor(async (err) => {
      if (err?.response?.status === 401) {
        handleUnauthorizedResponse(err.response, logoutAction);
      }
      return Promise.reject(err);
    });

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

function handleUnauthorizedResponse(response: any, logoutAction: any): void {
  const { slug, message } = response.data.error;

  const shouldLogoutError = [ApiErrorTypes.SESSION_EXPIRED, ApiErrorTypes.SESSION_LIMIT_EXCEEDED].includes(slug);

  let logoutMessage = null;
  if (shouldLogoutError) {
    logoutMessage = message;
  }
  if (logoutMessage) {
    vscode.window.showErrorMessage(logoutMessage);
  }

  logoutAction();
}

export { signIn, signOut, authenticate };
