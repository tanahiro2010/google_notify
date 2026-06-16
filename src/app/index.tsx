import { useEffect, useState } from "react";

const IndexPage = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setProfile(sessionStorage.getItem("profile"));  
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h2>hello</h2>
      <div>{JSON.stringify(profile)}</div>
      <div>{JSON.stringify(localStorage.getItem("access_token"))}</div>
    </div>
  )
};

export { IndexPage };