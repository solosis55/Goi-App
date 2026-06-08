import { hasDisplayableMedia, sanitizeForFeed } from "../../utils/postMedia";
import { isDataUrl, resolveUrl } from "../../utils/postMedia/url";
import { mockPost } from "../helpers/mockPost";

describe("postMedia", () => {
  it("detecta data URLs", () => {
    expect(isDataUrl("data:image/png;base64,abc")).toBe(true);
    expect(isDataUrl("https://x.test/a.jpg")).toBe(false);
  });

  it("sanitizeForFeed elimina data URLs", () => {
    const post = mockPost({
      content: "",
      media: [
        { type: "image", url: "data:image/png;base64,abc" },
        { type: "image", url: "/uploads/p1.jpg" },
      ],
    });

    const sanitized = sanitizeForFeed(post);
    expect(sanitized.media).toHaveLength(1);
    expect(hasDisplayableMedia(sanitized)).toBe(true);
  });

  it("resolveUrl devuelve null para data URL en native", () => {
    const originalOs = jest.requireActual("react-native").Platform.OS;
    Object.defineProperty(require("react-native").Platform, "OS", {
      configurable: true,
      get: () => "ios",
    });

    expect(resolveUrl("data:image/png;base64,abc")).toBeNull();

    Object.defineProperty(require("react-native").Platform, "OS", {
      configurable: true,
      get: () => originalOs,
    });
  });

  it("needsLazyPostMedia detecta posts con hasMedia sin URL usable", () => {
    const { needsLazyPostMedia } = require("../../utils/postMedia/display");
    expect(
      needsLazyPostMedia({
        hasMedia: true,
        media: undefined,
      })
    ).toBe(true);
    expect(
      needsLazyPostMedia({
        hasMedia: false,
        media: [{ type: "image", url: "/uploads/p1.jpg" }],
      })
    ).toBe(false);
  });
});
