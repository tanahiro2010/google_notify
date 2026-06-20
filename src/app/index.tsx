import { useMemo, useState } from "react";
import { useClassroom } from "../hooks/use-classroom";
import { useChat } from "../hooks/use-chat";
import { Loading } from "../components/screen/loading";
import { ClassroomCard } from "../components/unread/classroom-card";
import { ChatSpaceSection } from "../components/unread/chat-card";
import styles from "../styles/index.module.css";

const TEST_MODE = true; // false にすると期間フィルタが有効に
const INITIAL_DISPLAY_COUNT = 7;
const LOAD_MORE_COUNT = 10;

const developers = [
  { name: "tanahiro2010", href: "https://tanahiro2010.com" },
  { name: "田中博悠", href: "https://tanahiro2010.com" },
];

const IndexPage = () => {
  const classroomResult = useClassroom();
  const latestView = TEST_MODE ? null : localStorage.getItem("latest_view");
  const since = latestView && !isNaN(new Date(latestView).getTime())
    ? latestView
    : new Date(0).toISOString();
  const chatResult = useChat(`createTime > "${since}"`);

  const [developer] = useState(() =>
    developers[Math.floor(Math.random() * developers.length)]
  );
  const [classroomLimit, setClassroomLimit] = useState(INITIAL_DISPLAY_COUNT);
  const [chatLimit, setChatLimit] = useState(INITIAL_DISPLAY_COUNT);

  const unreadItems = useMemo(() => {
    const classroom = classroomResult.loading ? [] :
      classroomResult.classroomWorks.filter(
        (work) => new Date(work.updateTime) > new Date(since)
      );
    const chat = chatResult.loading ? [] : chatResult.chatMessages;
    return { classroom, chat };
  }, [classroomResult.classroomWorks, classroomResult.loading, chatResult.chatMessages, chatResult.loading, since]);

  if (classroomResult.loading || chatResult.loading) return <Loading isFullscreen={false} />;

  const profileRaw = sessionStorage.getItem("profile");
  const profile = profileRaw ? JSON.parse(profileRaw) as Record<string, unknown> : null;
  const userName = typeof profile?.name === "string" ? profile.name : null;

  const unreadTotal = unreadItems.classroom.length +
    unreadItems.chat.reduce((acc, s) => acc + s.messages.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          未読アイテム
          {unreadTotal > 0 && <span className={styles.badge}>{unreadTotal}</span>}
        </h1>
        {userName && <div className={styles.welcome}>ようこそ {userName} さん</div>}
      </div>

      <div className={styles.sideBySide}>
        <section className={styles.section}>
          <h2>Classroom ({unreadItems.classroom.length})</h2>
          {unreadItems.classroom.length === 0 ? (
            <div className={styles.empty}>未読はありません</div>
          ) : (
            <>
              {unreadItems.classroom.slice(0, classroomLimit).map((work) => (
                <ClassroomCard key={work.id} work={work} />
              ))}
              {classroomLimit < unreadItems.classroom.length && (
                <button className={styles.showMore} onClick={() => setClassroomLimit((p) => p + LOAD_MORE_COUNT)}>
                  さらに表示
                </button>
              )}
            </>
          )}
        </section>

        <section className={styles.section}>
          <h2>Google Chat ({unreadItems.chat.reduce((acc, s) => acc + s.messages.length, 0)})</h2>
          {unreadItems.chat.length === 0 ? (
            <div className={styles.empty}>未読はありません</div>
          ) : (
            <>
              {unreadItems.chat.slice(0, chatLimit).map((space) => (
                <ChatSpaceSection key={space.name} space={space} />
              ))}
              {chatLimit < unreadItems.chat.length && (
                <button className={styles.showMore} onClick={() => setChatLimit((p) => p + LOAD_MORE_COUNT)}>
                  さらに表示
                </button>
              )}
            </>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        Powered by <a href="https://unischool.jp">UniSchool</a> - <a href={developer.href}>{developer.name}</a>
      </footer>
    </div>
  );
};

export { IndexPage };