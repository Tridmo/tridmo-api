import slugify from "slugify";
import { generateRandomDigit } from "./utils";

export function generateUsernameFromName(full_name): string {
  const prefix = slugify(full_name.toLocaleLowerCase(), { replacement: '', lower: true, trim: true })
  const digits = generateRandomDigit(4)

  return prefix + digits;
}