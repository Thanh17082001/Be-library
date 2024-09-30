export function generateUserName(fullname: string, birthday: Date): string {
  // Chia tách họ tên thành các phần
  const nameParts = fullname.split(' ');
  const nameMiddle = nameParts.slice(0, nameParts.length - 1);

  // Lấy chữ cái đầu tiên của họ (phần đầu tiên) và phần tên (phần cuối cùng)
  let firstNameInitial = '';

  nameMiddle.forEach(item => (firstNameInitial += item.charAt(0).toLowerCase()));

  const lastName = nameParts[nameParts.length - 1].toLowerCase();

  // Chuyển đổi ngày sinh sang định dạng 'dd/mm/yyyy'
  const birthDate = new Date(birthday);
  const year = birthDate.getFullYear();

  // Kết hợp để tạo tên người dùng
  return `${firstNameInitial}${removeVietnameseTones(lastName)}${year}`;
}

function removeVietnameseTones(str) {
  const vietnameseChars = 'áàảãạâấầẩẫậăắằẳẵặêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ';
  const nonVietnameseChars = 'aaaaaaaaaaaaaaaaaeeeeeeeeeiiiiiioooooooooooooooouuuuuuuuuuyyyyy';

  const map = {};
  for (let i = 0; i < vietnameseChars.length; i++) {
    map[vietnameseChars[i]] = nonVietnameseChars[i];
  }

  return str
    .split('')
    .map(char => map[char] || char)
    .join('');
}
