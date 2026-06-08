import type { FeedWorkoutEvent, Post } from "../../types/post";

export function mockPost(overrides: Partial<Post> = {}): Post {
  return {
    id: "p1",
    userId: "u1",
    authorUsername: "cris",
    authorAvatarUrl: "",
    content: "test",
    sessionId: null,
    workoutId: null,
    createdAt: "2026-05-26T10:00:00.000Z",
    updatedAt: "2026-05-26T10:00:00.000Z",
    likesCount: 0,
    likedByMe: false,
    comments: [],
    visibility: "public",
    format: "standard",
    ...overrides,
  };
}

export function mockWorkoutEvent(overrides: Partial<FeedWorkoutEvent> = {}): FeedWorkoutEvent {
  return {
    id: "w1",
    userId: "u1",
    authorUsername: "cris",
    authorAvatarUrl: "",
    workoutId: "r1",
    workoutTitle: "Pull",
    performedAt: "2026-05-26T10:00:00.000Z",
    ...overrides,
  };
}
