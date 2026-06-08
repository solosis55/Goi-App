import { validateCreatePost } from "../../utils/createPostValidation";

describe("createPostValidation", () => {
  it("standard sin foto no puede publicarse", () => {
    const result = validateCreatePost("", 0, "standard");
    expect(result.canSubmit).toBe(false);
    expect(result.hint).toContain("foto");
  });

  it("standard con foto permite texto corto", () => {
    const result = validateCreatePost("hola", 1, "standard");
    expect(result.canSubmit).toBe(true);
  });

  it("training exige texto mínimo o foto", () => {
    const short = validateCreatePost("ok", 0, "training");
    expect(short.canSubmit).toBe(false);

    const withPhoto = validateCreatePost("", 1, "training");
    expect(withPhoto.canSubmit).toBe(true);
  });

  it("rechaza texto que supera el máximo", () => {
    const long = "x".repeat(3000);
    const result = validateCreatePost(long, 1, "standard");
    expect(result.canSubmit).toBe(false);
    expect(result.hint).toContain("Te pasaste");
  });
});
