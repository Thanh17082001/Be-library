export function generateRandomPassword(length: number = 8): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Ký tự in hoa
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'; // Ký tự in thường
  const numericChars = '0123456789'; // Ký tự số
  const specialChars = '!@#$%&?'; // Ký tự đặc biệt (nếu cần)

  // Kết hợp tất cả các ký tự
  const allChars = uppercaseChars + lowercaseChars + numericChars + specialChars;

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex]; // Thêm ký tự ngẫu nhiên vào mật khẩu
  }

  return password;
}
