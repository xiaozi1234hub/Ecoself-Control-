require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userService = require('./userService');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// 注册新用户
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码不能为空' });
        }

        // 验证邮箱格式
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: '邮箱格式不正确' });
        }

        // 验证密码长度
        if (password.length < 6 || password.length > 20) {
            return res.status(400).json({ error: '密码长度应为6-20位' });
        }

        const user = await userService.register(email, password);
        res.json({ message: '注册成功', user });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: error.message || '注册失败' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: '邮箱和密码不能为空' });
        }

        const result = await userService.login(email, password);
        res.json({ message: '登录成功', ...result });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(401).json({ error: error.message || '登录失败' });
    }
});

// 获取用户信息
app.get('/api/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const userData = await userService.getUserData(email);
        res.json(userData);
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(404).json({ error: error.message || '获取用户信息失败' });
    }
});

// 更新用户设置
app.put('/api/user/:email/settings', async (req, res) => {
    try {
        const { email } = req.params;
        const { settings } = req.body;
        const updatedSettings = await userService.updateUserSettings(email, settings);
        res.json(updatedSettings);
    } catch (error) {
        console.error('更新用户设置错误:', error);
        res.status(500).json({ error: error.message || '更新用户设置失败' });
    }
});

// 获取用户的待办事项列表
app.get('/api/user/:email/todos', async (req, res) => {
    try {
        const { email } = req.params;
        const todos = await userService.getUserTodos(email);
        res.json(todos);
    } catch (error) {
        console.error('获取待办事项错误:', error);
        res.status(404).json({ error: error.message || '获取待办事项失败' });
    }
});

// 添加待办事项
app.post('/api/user/:email/todos', async (req, res) => {
    try {
        const { email } = req.params;
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: '待办事项内容不能为空' });
        }

        const newTodo = await userService.addTodo(email, { content });
        res.json(newTodo);
    } catch (error) {
        console.error('添加待办事项错误:', error);
        res.status(500).json({ error: error.message || '添加待办事项失败' });
    }
});

// 更新待办事项
app.put('/api/user/:email/todos/:todoId', async (req, res) => {
    try {
        const { email, todoId } = req.params;
        const updates = req.body;
        
        const updatedTodo = await userService.updateTodo(email, todoId, updates);
        res.json(updatedTodo);
    } catch (error) {
        console.error('更新待办事项错误:', error);
        res.status(500).json({ error: error.message || '更新待办事项失败' });
    }
});

// 删除待办事项
app.delete('/api/user/:email/todos/:todoId', async (req, res) => {
    try {
        const { email, todoId } = req.params;
        await userService.deleteTodo(email, todoId);
        res.json({ message: '待办事项已删除' });
    } catch (error) {
        console.error('删除待办事项错误:', error);
        res.status(500).json({ error: error.message || '删除待办事项失败' });
    }
});

// 获取用户的集水量数据
app.get('/api/user/:email/water-collection', async (req, res) => {
    try {
        const { email } = req.params;
        const waterCollection = await userService.getWaterCollection(email);
        res.json(waterCollection);
    } catch (error) {
        console.error('获取集水量数据错误:', error);
        res.status(404).json({ error: error.message || '获取集水量数据失败' });
    }
});

// 添加集水量记录
app.post('/api/user/:email/water-collection', async (req, res) => {
    try {
        const { email } = req.params;
        const { amount } = req.body;
        
        if (typeof amount !== 'number' || amount < 0) {
            return res.status(400).json({ error: '无效的集水量数据' });
        }

        const waterCollection = await userService.addWaterCollection(email, amount);
        res.json(waterCollection);
    } catch (error) {
        console.error('添加集水量记录错误:', error);
        res.status(500).json({ error: error.message || '添加集水量记录失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 