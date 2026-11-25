/** Đọc tệp ảnh người dùng chọn và tải lên server nội bộ để lấy đường dẫn /img/custom/... */
export async function uploadGiftImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, GIF).');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Ảnh quá lớn (tối đa 2MB). Hãy chọn ảnh nhẹ hơn.');
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không đọc được tệp ảnh.'));
    reader.readAsDataURL(file);
  });
  const resp = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, dataUrl }),
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data?.success || !data?.url) {
    throw new Error(data?.error || 'Tải ảnh lên thất bại.');
  }
  return String(data.url);
}
