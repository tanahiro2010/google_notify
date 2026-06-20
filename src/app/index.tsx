import { useMemo } from "react";
import { useClassroom } from "../hooks/use-classroom";
import { useChat } from "../hooks/use-chat";
import { Loading } from "../components/screen/loading";
import type { ClassroomCourseWork } from "../types/classroom";
import type { ChatSpace, ChatMessage } from "../types/chat";
import styles from "../styles/index.module.css";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

const dueLabel = (work: ClassroomCourseWork) => {
  if (!work.dueDate) return null;
  const d = work.dueDate;
  const t = work.dueTime;
  const date = `${d.year}/${d.month}/${d.day}`;
  const time = t ? ` ${String(t.hours).padStart(2, "0")}:${String(t.minutes).padStart(2, "0")}` : "";
  return <span className={styles.dueLabel}>期限 {date + time}</span>;
};

const ClassroomCard = ({ work }: { work: ClassroomCourseWork }) => (
  <div className={styles.card}>
    <div className={styles.cardBody}>
      <p className={styles.cardTitle}>{work.title}</p>
      <div className={styles.cardMeta}>
        <span>更新: {formatDate(work.updateTime)}</span>
        {dueLabel(work)}
      </div>
    </div>
    <a
      className={styles.cardLink}
      href={work.alternateLink}
      target="_blank"
      rel="noopener noreferrer"
    >開く</a>
  </div>
);

const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => (
  <div className={styles.messageItem}>
    {msg.sender?.displayName && (
      <div className={styles.messageSender}>{msg.sender.displayName}</div>
    )}
    <div className={styles.messageText}>{msg.text ?? "(画像など)"}</div>
    <div className={styles.messageTime}>{formatDate(msg.createTime)}</div>
  </div>
);

const ChatSpaceSection = ({ space }: { space: ChatSpace & { messages: ChatMessage[] } }) => (
  <div className={styles.chatCard}>
    <div className={styles.spaceName}>{space.displayName ?? space.name}</div>
    {space.messages.map((msg) => (
      <ChatMessageItem key={msg.name} msg={msg} />
    ))}
  </div>
);

const IndexPage = () => {
  const classroomResult = useClassroom();
  const latestView = localStorage.getItem("latest_view");
  const since = latestView ?? new Date(0).toISOString();
  const chatResult = useChat(`createTime > "${since}"`);

  const unreadItems = useMemo(() => {
    const classroom = classroomResult.loading ? [] :
      classroomResult.classroomWorks.filter(
        (work) => new Date(work.updateTime) > new Date(since)
      );
    const chat = chatResult.loading ? [] : chatResult.chatMessages;
    return { classroom, chat };
  }, [classroomResult.classroomWorks, classroomResult.loading, chatResult.chatMessages, chatResult.loading, since]);

  if (classroomResult.loading || chatResult.loading) return <Loading isFullscreen={false} />;

  const unreadTotal = unreadItems.classroom.length +
    unreadItems.chat.reduce((acc, s) => acc + s.messages.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          未読アイテム
          {unreadTotal > 0 && <span className={styles.badge}>{unreadTotal}</span>}
        </h1>
      </div>

      <section className={styles.section}>
        <h2>Classroom ({unreadItems.classroom.length})</h2>
        {unreadItems.classroom.length === 0 ? (
          <div className={styles.empty}>未読はありません</div>
        ) : (
          unreadItems.classroom.map((work) => (
            <ClassroomCard key={work.id} work={work} />
          ))
        )}
      </section>

      <section className={styles.section}>
        <h2>Google Chat ({unreadItems.chat.reduce((acc, s) => acc + s.messages.length, 0)})</h2>
        {unreadItems.chat.length === 0 ? (
          <div className={styles.empty}>未読はありません</div>
        ) : (
          unreadItems.chat.map((space) => (
            <ChatSpaceSection key={space.name} space={space} />
          ))
        )}
      </section>
    </div>
  );
};

export { IndexPage };