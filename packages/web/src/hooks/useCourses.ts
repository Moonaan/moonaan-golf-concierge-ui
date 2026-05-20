// ============================================================
// useCourses — Fetch courses and availability
// Demo mode: returns mock data
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE, mockGetCourses, mockGetCourse, mockGetAvailability } from '@/lib/mock-api';
import { coursesApi, type Course, type TeeTime, ApiError } from '@/lib/api';

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  refetch: (params?: { region?: string }) => Promise<void>;
  getCourse: (courseId: string) => Promise<Course>;
}

export function useCourses(initialRegion?: string): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(
    async (params?: { region?: string }) => {
      try {
        setIsLoading(true);
        setError(null);

        if (DEMO_MODE) {
          const result = await mockGetCourses({
            region: params?.region || initialRegion,
          });
          setCourses(result.courses);
        } else {
          const result = await coursesApi.list({
            region: params?.region || initialRegion,
            status: 'ACTIVE',
          });
          setCourses(result.courses);
        }
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to load courses';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [initialRegion],
  );

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getCourse = useCallback(async (courseId: string): Promise<Course> => {
    if (DEMO_MODE) {
      return mockGetCourse(courseId);
    }
    return coursesApi.get(courseId);
  }, []);

  return { courses, isLoading, error, refetch: fetchCourses, getCourse };
}

// ── Availability Hook ───────────────────────────────────────

interface UseAvailabilityReturn {
  teeTimes: TeeTime[];
  isLoading: boolean;
  error: string | null;
  search: (params: {
    courseId: string;
    date: string;
    partySize?: number;
    holes?: number;
  }) => Promise<void>;
}

export function useAvailability(): UseAvailabilityReturn {
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (params: {
      courseId: string;
      date: string;
      partySize?: number;
      holes?: number;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        if (DEMO_MODE) {
          const result = await mockGetAvailability(
            params.courseId,
            params.date,
            params.partySize,
            params.holes,
          );
          setTeeTimes(result.teeTimes);
        } else {
          const result = await coursesApi.getAvailability(
            params.courseId,
            params.date,
            params.partySize,
            params.holes,
          );
          setTeeTimes(result.teeTimes);
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Failed to load availability';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { teeTimes, isLoading, error, search };
}
