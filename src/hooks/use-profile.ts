import { useState, useEffect } from 'react';
import { GoogleAPIClient } from '../lib/google';

const useProfile = (token: string) => {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const client = new GoogleAPIClient(token);
    client.fetch("/oauth2/v3/userinfo").then(async (response) => {
      if (!response.ok) throw new Error("リクエストが失敗しました");
      return response.json();
    }).then((data: Record<string, unknown>) => {
      setProfile(data);
      setIsLoading(false);
    }).catch(console.error);
  }, [token]);

  return { isLoading, profile } as const;
}

export { useProfile };