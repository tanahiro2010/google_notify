import { useState } from "react";
import { CircularProgress } from "@mui/material";

type Member = {
  name: string;
  href: string;
}
const members: Array<Member> = [
  { name: "tanahiro2010", href: "https://tanahiro2010.com" }
]

const Loading = () => {
  const [member, setMember] = useState<Member>(() => members[Math.floor(Math.random() * members.length)]);

  return (
    <main className="loading">
      <div>
        <CircularProgress aria-label="Loading…"/>
        <span className="credit">Powered by <a href="https://unischool.jp">UniSchool</a> - <a href={member.href}>{member.name}</a></span>
      </div>
    </main>
  )
}

export { Loading };