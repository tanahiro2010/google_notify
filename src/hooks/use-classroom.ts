import type { ClassroomFeedItem } from "../types/classroom";
import { useState, useEffect } from 'react';
import { GoogleAPIClient } from '../lib/google';

const announcementTitle = (text: string) => {
  const firstLine = text?.trim().split("\n")[0]?.trim();
  return firstLine || "お知らせ";
};

const useClassroom = (token: string | null) => {
  const [classroomWorks, setClassroomWorks] = useState<Array<ClassroomFeedItem>>([]);
  const [loading, setLoading] = useState(() => !token);
  const [error, setError] = useState<Error | null>(
    () => token ? null : new Error("アクセストークンが見つかりません")
  );
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  useEffect(() => {
    const fetchClassroomWorks = async () => {
      if (!token || hasFetched) return;

      setError(null);
      const client = new GoogleAPIClient(token);

      try {
        const courses = await client.fetchCourses();
        const items = await Promise.all(courses.map(async (course) => {
          const [courseWorks, announcements] = await Promise.all([
            client.fetchCourseWorks(course.id).catch((err) => {
              console.error(`Course works fetch error for ${course.id}:`, err);
              return [];
            }),
            client.fetchAnnouncements(course.id).catch((err) => {
              console.error(`Announcements fetch error for ${course.id}:`, err);
              return [];
            }),
          ]);
          const normalizedWorks: ClassroomFeedItem[] = courseWorks.map((work) => ({
            id: work.id,
            courseId: work.courseId,
            kind: "courseWork",
            title: work.title,
            alternateLink: work.alternateLink,
            creationTime: work.creationTime,
            updateTime: work.updateTime,
            dueDate: work.dueDate,
            dueTime: work.dueTime,
          }));
          const normalizedAnnouncements: ClassroomFeedItem[] = announcements.map((announcement) => ({
            id: announcement.id,
            courseId: announcement.courseId,
            kind: "announcement",
            title: announcementTitle(announcement.text),
            alternateLink: announcement.alternateLink,
            creationTime: announcement.creationTime,
            updateTime: announcement.updateTime,
          }));
          return [...normalizedWorks, ...normalizedAnnouncements];
        }));
        const sortedItems = items.flat().sort(
          (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
        );
        setClassroomWorks(sortedItems);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }

    fetchClassroomWorks();
  }, [token, hasFetched]);

  return { classroomWorks, loading, error, setHasFetched } as const;
}

export { useClassroom };