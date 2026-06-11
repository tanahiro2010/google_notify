import { useEffect, useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import { Loading } from "../screen/loading";
import { Modal } from "../ui/modal";

const SessionProvider = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // 最初はログインしてるという状態で（モーダルが開かないため）

  useEffect(() => {
    const currentSession = localStorage.getItem("session");
    if (currentSession) return setIsLoading(false);
    setIsLoggedIn(false);
    setIsLoading(false);
  }, []);

  if (isLoading) return <Loading />;
  if (!isLoading && !isLoggedIn) return (
    <Modal isOpen={!isLoggedIn}>
      a
    </Modal>
  );
  return null;
};

export { SessionProvider };