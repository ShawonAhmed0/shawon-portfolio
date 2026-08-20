import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Media on this site is fixed-size, decorative, locally hosted frame
      // placeholders with explicit dimensions — next/image adds nothing here
      // and the spec calls for plain loading="lazy" <img> frames.
      "@next/next/no-img-element": "off",
    },
  },
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
];

export default eslintConfig;
