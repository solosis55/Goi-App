import { useNotificationPrefsStore } from "../../stores/useNotificationPrefsStore";
import type { NotificationPrefs } from "../../utils/notificationPrefs";

jest.mock("../../utils/notificationPrefs", () => ({
  loadNotificationPrefs: jest.fn(),
  saveNotificationPrefs: jest.fn(),
}));

import { loadNotificationPrefs, saveNotificationPrefs } from "../../utils/notificationPrefs";

const loadMock = loadNotificationPrefs as jest.MockedFunction<typeof loadNotificationPrefs>;
const saveMock = saveNotificationPrefs as jest.MockedFunction<typeof saveNotificationPrefs>;

describe("useNotificationPrefsStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    saveMock.mockResolvedValue(undefined);
    useNotificationPrefsStore.setState({
      prefs: { mutedTypes: [] },
      hydrated: false,
    });
  });

  it("hydrate carga preferencias desde almacenamiento local", async () => {
    loadMock.mockResolvedValue({ mutedTypes: ["follow"] });

    await useNotificationPrefsStore.getState().hydrate();

    expect(useNotificationPrefsStore.getState().prefs.mutedTypes).toEqual(["follow"]);
    expect(useNotificationPrefsStore.getState().hydrated).toBe(true);
  });

  it("setPrefs normaliza mutedTypes y persiste", () => {
    useNotificationPrefsStore.getState().setPrefs({ mutedTypes: ["like", "comment"] });

    expect(useNotificationPrefsStore.getState().prefs.mutedTypes).toEqual(["like", "comment"]);
    expect(saveMock).toHaveBeenCalledWith({ mutedTypes: ["like", "comment"] });
  });

  it("applyRemotePrefs ignora mutedTypes inválidos", () => {
    useNotificationPrefsStore.getState().applyRemotePrefs({
      mutedTypes: null,
    } as unknown as NotificationPrefs);

    expect(useNotificationPrefsStore.getState().prefs.mutedTypes).toEqual([]);
    expect(useNotificationPrefsStore.getState().hydrated).toBe(true);
  });
});
