import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SiGoogle } from "react-icons/si";
import { useProfile } from "../../hooks/use-profile";
import { Loading } from "../screen/loading";
import { Modal } from "../ui/modal";
import type { LoginResponse } from "../../types/auth";
import styles from "../../styles/session.module.css";

const storeTokenData = (res: LoginResponse) => {
  localStorage.setItem("access_token", res.access_token);
  if (res.refresh_token) {
    localStorage.setItem("refresh_token", res.refresh_token);
  }
  localStorage.setItem("expires_at", String(Date.now() + res.expires_in * 1000));
};

const SessionProvider = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);

  const { isLoading: isProfileLoading, profile } = useProfile(token ?? "");

  useEffect(() => {
    if (profile) {
      sessionStorage.setItem("profile", JSON.stringify(profile));
    }
  }, [profile]);

  const handleButtonClick = async () => {
    setIsLoggingIn(true);
    try {
      const res = await invoke<LoginResponse>("login");
      storeTokenData(res);
      setToken(res.access_token);
      setIsLoggedIn(true);
    } catch (e) {
      console.error("Login failed:", e);
      alert(`ログインに失敗しました\n${e}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading || isProfileLoading) return <Loading />;
  if (!isLoggedIn) return (
    <Modal
      isOpen={!isLoggedIn}
      style={{ minWidth: 0, maxWidth: 400, width: "90vw" }}
    >
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>ログイン</h1>
          <p className={styles.subtitle}>Google アカウントで続行</p>
        </div>

        <button
          className={styles.loginBtn}
          onClick={handleButtonClick}
          disabled={isLoggingIn}
        >
          <SiGoogle />
          {isLoggingIn ? "ログイン中..." : "Sign in with Google"}
        </button>
      </div>
    </Modal>
  );
  return null;
};

export { SessionProvider };
