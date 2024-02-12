import { isEmpty } from 'class-validator'
import slugify from 'slugify'

const generateSlug = (text: string) => {
 return slugify(text, {
    replacement: '-',
    lower: true
  })
}

export const indexSlug = (slug: string, similarSlugs: string[]) => {

  if (!similarSlugs.length) return slug;

  let result;
  let matched = slug;
  let matchedFound = false

  loop: for (const item of similarSlugs) {
      if (item.includes(slug) && item.includes("_") && item.length - 2 == slug.length){
          matched = item
          matchedFound = true
          break loop;
      }
  }

  const index = (matched.split("_"))[1]
  if (matchedFound && index && !isNaN(Number(index)))
    result = `${slug}_${Number(index) + 1}`
  else if (!index || isNaN(Number(index)))
    result = `${slug}_1`;
  else
    return slug

  return result
}

export default generateSlug