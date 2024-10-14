import { flag } from "@vercel/flags/sveltekit";

export const showJson = flag<boolean>({
  key: "showJson",
  description: "Show RAW JSON of returned data",
  options: [{ value: true }, { value: false }],
  decide(_event) {
    return false;
  },
});
