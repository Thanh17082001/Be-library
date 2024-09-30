import {diskStorage} from 'multer';
import * as path from 'path';
import {mkdirSync, existsSync} from 'fs';

export const storage = (folder: string) =>
  diskStorage({
    destination: (req, file, cb) => {
      // Đường dẫn động được truyền từ controller thông qua biến folder
      // ngoài thư mục dist
      const uploadPath = path.join(__dirname, '..', '..', 'public', folder);
      // Tạo thư mục nếu nó không tồn tại
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, {recursive: true});
      }

      cb(null, uploadPath); // Trả về đường dẫn lưu trữ
    },
    filename: (req, file, cb) => {
      // Tạo tên tệp ngẫu nhiên
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${randomName}${path.extname(file.originalname)}`);
    },
  });

export const multerOptions = {
  limits: {
    fileSize: 1024 * 1024 * 1024, // Giới hạn kích thước tệp (5MB)
  },
};
