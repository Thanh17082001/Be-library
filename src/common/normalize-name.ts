export function normalizeString(fileName) {
  const parts = fileName.split('.');
  if (parts.length < 2) {
    return fileName; // Nếu không có phần mở rộng, trả lại tên gốc
  }

  const name = parts.slice(0, -1).join('.');
  const extension = parts[parts.length - 1];

  const normalizedName = removeSpaces(removeVietnameseTones(name));

  return `${normalizedName}.${extension}`;
}

function removeVietnameseTones(str: string): string {
  // remove accents
  var from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ',
    to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], 'gi'), to[i]);
  }

  str = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-');

  return str;
}

function removeSpaces(str: string): string {
  return str.replace(/\s+/g, '');
}
