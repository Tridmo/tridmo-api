import sharp from 'sharp';

export default async (data, dimensions?: { width: number; height: number }, options?: { quality?: number }) => {

  const sizes = dimensions || {}

  const file = !!data?.data || !(data instanceof Uint8Array) ? data.data : data

  const resized = await sharp(file)
    .resize({
      fit: 'cover',
      ...sizes
    })
    .webp({ quality: options.quality || 30 })
    .toBuffer();

  const resizedInfo = await sharp(resized).metadata();

  const result = {
    ...data,
    data: resized,
    size: resizedInfo.size,
    mimetype: `image/${resizedInfo.format}`
  }

  return result;
}; 