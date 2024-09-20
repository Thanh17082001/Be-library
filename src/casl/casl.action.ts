
export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}


enum Resource {
    Article = 'article',
    User = 'user',
    Example= 'example'
}

// Sinh ra các tên quyền động
function generatePermissions(role: string): string[] {
    const permissions: string[] = [];

    switch (role) {
        case 'admin':
            // Admin có quyền trên tất cả các hành động và tài nguyên
            for (const action of Object.values(Action)) {
                for (const resource of Object.values(Resource)) {
                    permissions.push(`${action}_${resource}`);
                }
            }
            break;

        case 'teacher':
            // Editor có quyền đọc và cập nhật bài viết
            permissions.push('read_article');
            permissions.push('update_article');
            break;

        case 'student':
            // Student chỉ có quyền đọc bài viết
            permissions.push('read_article');
            break;

        default:
            // Vai trò khác có thể không có quyền
            permissions.push('read_article'); // Quyền mặc định
            break;
    }

    return permissions;
}
