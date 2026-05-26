const BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};
