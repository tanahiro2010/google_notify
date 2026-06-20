import type { ListCoursesResponse, ListCourseWorkResponse } from "../types/classroom";
import type { ListSpacesResponse, ListMessagesResponse } from "../types/chat";

class GoogleAPIClient {
  private readonly accessToken: string;
  private readonly apiBaseUrl: string;

  constructor(accessToken: string, apiBaseUrl?: string) {
    this.accessToken = accessToken;
    this.apiBaseUrl = apiBaseUrl ?? "https://www.googleapis.com";
  }

  private isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  async fetch(endpoint: string, options: RequestInit = {
    method: "GET",
  }): Promise<Response> {
    const url = this.isAbsoluteUrl(endpoint) 
    ? endpoint 
    : `${this.apiBaseUrl}${endpoint}`;
    const headers = {
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Google Classroom API
  async fetchCourses() {
    const url = new URL(`https://classroom.googleapis.com/v1/courses`);
    url.searchParams.append("courseStates", "ACTIVE");
    url.searchParams.append("pageSize", "50");
    
    const res = await this.fetch(url.toString());
    const data: ListCoursesResponse = await res.json();

    return data.courses ?? [];
  }

  async fetchCourseWorks(courseId: string) {
    const url = new URL(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`);
    url.searchParams.append("orderBy", "updateTime desc");
    url.searchParams.append("pageSize", "20");

    const res = await this.fetch(url.toString());
    const data: ListCourseWorkResponse = await res.json();

    return data.courseWork ?? [];
  }

  // Google Chat API
  async fetchChatSpaces() {
    const url = new URL(`https://chat.googleapis.com/v1/spaces`);
    url.searchParams.append("pageSize", "50");

    const res = await this.fetch(url.toString());
    const data: ListSpacesResponse = await res.json();

    return data.spaces ?? [];
  }

  async fetchChatMessages(spaceName: string, filter: string) {
    const url = new URL(`https://chat.googleapis.com/v1/${spaceName}/messages`);
    url.searchParams.append("filter", filter);
    url.searchParams.append("orderBy", "createTime desc");
    url.searchParams.append("pageSize", "20");
    
    const res = await this.fetch(url.toString());
    const data: ListMessagesResponse = await res.json();

    return data.messages ?? [];
  }
}

export { GoogleAPIClient };