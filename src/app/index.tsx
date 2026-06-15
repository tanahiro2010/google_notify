import { useEffect, useState } from "react";

const IndexPage = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setInterval(() => {
      setProfile(sessionStorage.getItem("profile"));  
    }, 1000);
  }, []);

  return (
    <div>
      <h2>hello</h2>
      <div>{JSON.stringify(profile)}</div>
      <div>{JSON.stringify(localStorage.getItem("session"))}</div>
    </div>
  )
};

export { IndexPage };