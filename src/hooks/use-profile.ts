import { GoogleAPIClient } from '../lib/google';

const useProfile = (token: string) => {
  const client = new GoogleAPIClient(token);

  return client.fetch("/oauth2/v3/userinfo").then(async (response) => {
    if (!response.ok) throw new Error("リクエストが失敗しました");
    return response.json();
  });
}

export { useProfile };