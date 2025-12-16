# AI对话助手

一个简单美观的在线AI对话网页应用，支持与AI模型进行实时对话。

## 功能特点

- 🎨 现代化的聊天界面设计
- 💬 实时AI对话功能
- 📱 响应式设计，支持移动端
- ⚡ 快速响应，流畅体验
- 🔒 安全的API密钥管理

## 项目结构

```
简单网页/
├── app.py                 # Flask后端应用
├── requirements.txt       # Python依赖包
├── .env                  # 环境变量配置（需要创建）
├── .env.example          # 环境变量配置示例
├── templates/
│   └── index.html        # 前端HTML页面
└── static/
    ├── style.css         # 样式文件
    └── script.js         # 前端JavaScript
```

## 安装步骤

### 1. 安装Python依赖

```bash
pip install -r requirements.txt
```

### 2. 配置API密钥

1. 复制 `.env.example` 文件为 `.env`：
```bash
copy .env.example .env
```

2. 编辑 `.env` 文件，填入你的AI API密钥：
```
AI_API_KEY=your-api-key-here
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-3.5-turbo
```

### 3. 运行应用

```bash
python app.py
```

### 4. 访问应用

在浏览器中打开：`http://localhost:5000`

## 支持的AI服务

本项目默认配置为OpenAI API，但可以轻松适配其他AI服务：

- OpenAI (GPT-3.5, GPT-4)
- 其他兼容OpenAI API格式的服务

只需修改 `.env` 文件中的 `AI_API_URL` 和 `AI_MODEL` 即可。

## 使用说明

1. 在输入框中输入你的问题或消息
2. 点击"发送"按钮或按Enter键发送
3. 等待AI回复显示在聊天界面
4. 继续对话...

## 注意事项

- 请妥善保管你的API密钥，不要将 `.env` 文件提交到代码仓库
- 确保你的API密钥有足够的额度
- 如果遇到网络错误，请检查API密钥是否正确以及网络连接是否正常

## 技术栈

- **后端**: Flask (Python)
- **前端**: HTML5, CSS3, JavaScript (原生)
- **API**: 支持OpenAI兼容的API接口

## 许可证

MIT License
