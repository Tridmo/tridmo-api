import sharp from 'sharp';

export default async (data, dimensions: { width: number; height: number }) => {
  const resized = await sharp(data.data)
    .resize({
      fit: 'cover',
      width: dimensions.width,
      height: dimensions.height
    })
    .jpeg({ quality: 98 })
    .toBuffer();

  const resizedInfo = await sharp(resized).metadata();

  return {
    ...data,
    data: resized,
    size: resizedInfo.size

  };
}; 