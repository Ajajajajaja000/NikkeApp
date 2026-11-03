import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicPath = (...parts: string[]) => resolve(process.cwd(), "public", ...parts);

function readPngSize(fileName: string) {
  const png = readFileSync(publicPath(fileName));
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

describe("PWAアイコン", () => {
  it.each([
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["icon-maskable-512.png", 512],
  ])("%s が正しい正方形PNGである", (fileName, size) => {
    expect(readPngSize(fileName)).toEqual({ width: size, height: size });
  });

  it("manifestが通常用とマスク対応アイコンを参照する", () => {
    const manifest = JSON.parse(readFileSync(publicPath("manifest.webmanifest"), "utf8"));
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "./icon-192.png", sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ src: "./icon-512.png", sizes: "512x512", purpose: "any" }),
        expect.objectContaining({ src: "./icon-maskable-512.png", sizes: "512x512", purpose: "maskable" }),
      ]),
    );
  });
});
