import type { ClassroomCourseWork } from "../types/classroom";
import { useState, useEffect } from 'react';
import { GoogleAPIClient } from '../lib/google';


const useClassroom = (token: string | null) => {
  const [classroomWorks, setClassroomWorks] = useState<Array<ClassroomCourseWork>>([]);
  const [loading, setLoading] = useState(() => !token);
  const [error, setError] = useState<Error | null>(
    () => token ? null : new Error("アクセストークンが見つかりません")
  );
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  useEffect(() => {
    console.log("useClassroom effect triggered with token:", token, "hasFetched:", hasFetched);
    const fetchClassroomWorks = async () => {
      if (!token || hasFetched) return;

      setError(null);
      const client = new GoogleAPIClient(token);

      try {
        const courses = await client.fetchCourses();
        const updatedCourses = courses.sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
        const works = await Promise.all(updatedCourses.map(async (course) => {
          const courseWorks = await client.fetchCourseWorks(course.id);
          return courseWorks;
        }));
        setClassroomWorks(works.flat());
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