jest.mock("../../utils/feedLocalPrefs", () => ({
  saveSavedPostIds: jest.fn().mockResolvedValue(undefined),
  saveMutedUserIds: jest.fn().mockResolvedValue(undefined),
  loadMutedUserIds: jest.fn().mockResolvedValue([]),
  loadSavedPostIds: jest.fn().mockResolvedValue([]),
  loadSuggestionsDismiss: jest.fn().mockResolvedValue({ mode: "none" }),
}));

import { useFeedPrefsStore } from "../../stores/useFeedPrefsStore";

describe("useFeedPrefsStore", () => {
  beforeEach(() => {
    useFeedPrefsStore.setState({
      goldBeamEnabled: true,
      feedScope: "following",
      feedScopeReady: false,
      feedPrefsUserId: null,
      localPrefsHydratedAt: 0,
      mutedUserIds: [],
      savedPostIds: [],
      suggestionsDismiss: { mode: "none" },
    });
  });

  it("toggleSavedPostForUser añade y quita optimistamente", () => {
    expect(useFeedPrefsStore.getState().toggleSavedPostForUser("u1", "p1")).toBe(true);
    expect(useFeedPrefsStore.getState().savedPostIds).toEqual(["p1"]);

    expect(useFeedPrefsStore.getState().toggleSavedPostForUser("u1", "p1")).toBe(false);
    expect(useFeedPrefsStore.getState().savedPostIds).toEqual([]);
  });

  it("muteAuthor y unmuteAuthor actualizan la lista", async () => {
    await useFeedPrefsStore.getState().muteAuthor("u1", "u2");
    expect(useFeedPrefsStore.getState().mutedUserIds).toEqual(["u2"]);

    await useFeedPrefsStore.getState().unmuteAuthor("u1", "u2");
    expect(useFeedPrefsStore.getState().mutedUserIds).toEqual([]);
  });
});
