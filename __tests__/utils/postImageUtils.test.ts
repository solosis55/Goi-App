import { pendingImageEntriesFromImages } from "../../hooks/createPost/postImageUtils";

describe("postImageUtils pending queue", () => {
  it("guarda sourceUri y cropSquare para reintentos offline", () => {
    const entries = pendingImageEntriesFromImages([
      {
        id: "1",
        uri: "file:///cache/processed.jpg",
        dataUrl: "",
        sourceUri: "file:///picker/original.jpg",
        cropSquare: false,
        uploadFile: {
          uri: "file:///cache/processed.jpg",
          name: "post.jpg",
          type: "image/jpeg",
        },
      },
    ]);

    expect(entries).toEqual([
      { localUri: "file:///picker/original.jpg", cropSquare: false },
    ]);
  });
});
