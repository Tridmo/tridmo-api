import { isEmpty } from 'class-validator'
import slugify from 'slugify'

const generateSlug = (
  text: string,
  options?: {
    replacement?: string;
    remove?: RegExp;
    lower?: boolean;
    strict?: boolean;
    locale?: string;
    trim?: boolean;
  }
) => {
  return slugify(text, {
    replacement: options?.replacement || '-',
    lower: options?.lower || true
  })
}

export const indexSlug = (slug: string, similarSlugs: string[]) => {

  if (!similarSlugs.length) return slug;

  let result;
  let matched = slug;
  let matchedFound = false
  let highestIndex = 0;

  loop: for (const item of similarSlugs) {
    const s = item.split("_")[0]
    const i = Number(item.split("_")[1])
    if (item.split("_")[0] == slug) {
      matched = item
      matchedFound = true
    }

    if (i && !isNaN(i) && i > highestIndex) highestIndex = i
  }

  if (matchedFound && highestIndex && !isNaN(highestIndex))
    result = `${slug}_${highestIndex + 1}`
  else if (!highestIndex || isNaN(highestIndex))
    result = `${slug}_1`;
  else
    result = slug

  return result
}

export default generateSlug