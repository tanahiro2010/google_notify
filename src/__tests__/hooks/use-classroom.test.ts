import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useClassroom } from "../../hooks/use-classroom";

const mockMethods = vi.hoisted(() => ({
  fetchCourses: vi.fn(),
  fetchCourseWorks: vi.fn(),
  fetchAnnouncements: vi.fn(),
}));

vi.mock("../../lib/google", () => ({
  GoogleAPIClient: class {
    fetchCourses = mockMethods.fetchCourses;
    fetchCourseWorks = mockMethods.fetchCourseWorks;
    fetchAnnouncements = mockMethods.fetchAnnouncements;
  },
}));

beforeEach(() => {
  mockMethods.fetchCourses.mockReset();
  mockMethods.fetchCourseWorks.mockReset();
  mockMethods.fetchAnnouncements.mockReset();
  mockMethods.fetchAnnouncements.mockResolvedValue([]);
});

describe("useClassroom", () => {
  it("starts with loading false when token is provided", () => {
    mockMethods.fetchCourses.mockResolvedValue([]);
    const { result } = renderHook(() => useClassroom("valid-token"));
    expect(result.current.loading).toBe(false);
  });

  it("returns error immediately when token is null", () => {
    const { result } = renderHook(() => useClassroom(null));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeTruthy();
    expect(result.current.classroomWorks).toEqual([]);
  });

  it("fetches courses and course works successfully", async () => {
    mockMethods.fetchCourses.mockResolvedValue([
      { id: "c1", name: "Math" },
      { id: "c2", name: "Science" },
    ]);
    mockMethods.fetchCourseWorks
      .mockResolvedValueOnce([
        { id: "w1", title: "Homework 1", courseId: "c1" },
      ])
      .mockResolvedValueOnce([
        { id: "w2", title: "Homework 2", courseId: "c2" },
      ]);

    const { result } = renderHook(() => useClassroom("valid-token"));

    await waitFor(() => expect(result.current.classroomWorks.length).toBe(2));

    expect(result.current.error).toBeNull();
    expect(result.current.classroomWorks[0].title).toBe("Homework 1");
    expect(result.current.classroomWorks[1].title).toBe("Homework 2");
  });

  it("sets error when fetch fails", async () => {
    mockMethods.fetchCourses.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useClassroom("valid-token"));

    await waitFor(() => expect(result.current.error).toBeTruthy());

    expect(result.current.error?.message).toBe("Network error");
    expect(result.current.classroomWorks).toEqual([]);
  });

  it("merges announcements alongside course works", async () => {
    mockMethods.fetchCourses.mockResolvedValue([
      { id: "c1", name: "Math" },
    ]);
    mockMethods.fetchCourseWorks.mockResolvedValue([
      { id: "w1", title: "Homework 1", courseId: "c1", updateTime: "2026-07-10T00:00:00.000Z" },
    ]);
    mockMethods.fetchAnnouncements.mockResolvedValue([
      { id: "a1", text: "テスト範囲について\n詳細は...", courseId: "c1", updateTime: "2026-07-15T00:00:00.000Z" },
    ]);

    const { result } = renderHook(() => useClassroom("valid-token"));

    await waitFor(() => expect(result.current.classroomWorks.length).toBe(2));

    expect(result.current.classroomWorks[0].kind).toBe("announcement");
    expect(result.current.classroomWorks[0].title).toBe("テスト範囲について");
    expect(result.current.classroomWorks[1].kind).toBe("courseWork");
  });

  it("handles course with no works", async () => {
    mockMethods.fetchCourses.mockResolvedValue([
      { id: "c1", name: "Empty Course" },
    ]);
    mockMethods.fetchCourseWorks.mockResolvedValue([]);

    const { result } = renderHook(() => useClassroom("valid-token"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.classroomWorks).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
