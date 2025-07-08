const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class UserService {
    constructor() {
        this.usersFile = path.join(__dirname, 'data', 'users.json');
        this.users = new Map();
        this.init();
    }

    async init() {
        try {
            // 确保data目录存在
            await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
            
            // 尝试读取用户数据文件
            try {
                const data = await fs.readFile(this.usersFile, 'utf8');
                const users = JSON.parse(data);
                this.users = new Map(Object.entries(users));
            } catch (error) {
                // 如果文件不存在，创建空文件
                await this.saveUsers();
            }
        } catch (error) {
            console.error('初始化用户服务失败:', error);
        }
    }

    // 保存用户数据到文件
    async saveUsers() {
        try {
            const data = Object.fromEntries(this.users);
            await fs.writeFile(this.usersFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('保存用户数据失败:', error);
            throw new Error('保存用户数据失败');
        }
    }

    // 生成密码哈希
    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return { hash, salt };
    }

    // 验证密码
    verifyPassword(password, hash, salt) {
        const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }

    // 注册新用户
    async register(email, password) {
        // 检查邮箱是否已注册
        if (this.users.has(email)) {
            throw new Error('该邮箱已被注册');
        }

        // 生成密码哈希
        const { hash, salt } = this.hashPassword(password);

        // 创建用户对象
        const user = {
            email,
            hash,
            salt,
            createdAt: new Date().toISOString(),
            settings: {
                theme: 'light',
                notifications: true
            },
            todos: [],  // 添加待办事项列表
            waterCollection: {  // 添加集水量数据
                total: 0,
                history: []
            }
        };

        // 保存用户数据
        this.users.set(email, user);
        await this.saveUsers();

        // 返回用户信息（不包含敏感数据）
        return {
            email: user.email,
            createdAt: user.createdAt,
            settings: user.settings,
            todos: user.todos,
            waterCollection: user.waterCollection
        };
    }

    // 用户登录
    async login(email, password) {
        const user = this.users.get(email);
        
        if (!user) {
            throw new Error('用户不存在');
        }

        if (!this.verifyPassword(password, user.hash, user.salt)) {
            throw new Error('密码错误');
        }

        // 生成会话令牌
        const token = crypto.randomBytes(32).toString('hex');
        
        // 返回用户信息和令牌
        return {
            token,
            user: {
                email: user.email,
                createdAt: user.createdAt,
                settings: user.settings
            }
        };
    }

    // 获取用户信息
    async getUserData(email) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }

        return {
            email: user.email,
            createdAt: user.createdAt,
            settings: user.settings
        };
    }

    // 更新用户设置
    async updateUserSettings(email, settings) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }

        user.settings = { ...user.settings, ...settings };
        await this.saveUsers();

        return user.settings;
    }

    // 获取用户的待办事项列表
    async getUserTodos(email) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }
        return user.todos;
    }

    // 添加待办事项
    async addTodo(email, todo) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }

        const newTodo = {
            id: crypto.randomBytes(16).toString('hex'),
            content: todo.content,
            completed: false,
            createdAt: new Date().toISOString()
        };

        user.todos.push(newTodo);
        await this.saveUsers();
        return newTodo;
    }

    // 更新待办事项状态
    async updateTodo(email, todoId, updates) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }

        const todoIndex = user.todos.findIndex(todo => todo.id === todoId);
        if (todoIndex === -1) {
            throw new Error('待办事项不存在');
        }

        user.todos[todoIndex] = { ...user.todos[todoIndex], ...updates };
        await this.saveUsers();
        return user.todos[todoIndex];
    }

    // 删除待办事项
    async deleteTodo(email, todoId) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }

        user.todos = user.todos.filter(todo => todo.id !== todoId);
        await this.saveUsers();
    }

    // 获取用户的集水量数据
    async getWaterCollection(email) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }
        return user.waterCollection;
    }

    // 添加集水量记录
    async addWaterCollection(email, amount) {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('用户不存在');
        }

        const record = {
            amount,
            timestamp: new Date().toISOString()
        };

        user.waterCollection.total += amount;
        user.waterCollection.history.push(record);
        await this.saveUsers();
        return user.waterCollection;
    }
}

module.exports = new UserService(); 