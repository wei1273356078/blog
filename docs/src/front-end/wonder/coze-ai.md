# 使用扣子API实现一个简单的AI聊天机器人

## 一、 准备工作

### 1、 登录扣子，且进入扣子中心

扣子网站：https://www.coze.cn/


### 2、 创建智能体且获取BOT_ID

- 新建一个工作空间
- 再创建一个`智能体`。![在这里插入图片描述](/imgs/1759141163414.webp)
- 创建`智能体`成功后，在当前页面的地址栏中`www.coze.cn/space/xxx/bot/xxx`，`/bot/`后面的值就是`BOT_ID`
- 点击右上角发布按钮
- 再点击跳过直接发布按钮
- 在【发布】页中，选择发布的平台，注意：在API选项中，一定要勾选**API**选项。![在这里插入图片描述](/imgs/175914242530.webp)
- 最后点击右上角发布按钮，等待扣子审核通过

### 3、 获取TOKEN

- 左侧导航，点击“API管理”页进入
- 点击顶部“授权”页
- 选择`服务身份及凭证`或`个人访问令牌`。![在这里插入图片描述](/imgs/17591426687567.webp)
- 点击添加按钮
- 配置选项。注意：权限选项要`全选`，访问工作空间选择`所有工作空间`。![在这里插入图片描述](/imgs/20250929184703.webp)
- 点击“确定”按钮后，会弹出一个弹框，弹框中有令牌，复制这个令牌就得到了TOKEN。![在这里插入图片描述](/imgs/20250929185046.webp)

## 二、 代码展示

### 1、 HTML代码展示

```html
    <div id="chat-box"></div>
    <div class="input-box">
        <input type="text" id="user-input" />
        <button id="send-btn">发送</button>
    </div>
```

### 2、 CSS代码展示

```css
    #chat-box {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 600px;
        height: 500px;
        margin: 20px auto;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        overflow-y: auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .input-box {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 600px;
        margin: 10px auto;
    }
    #user-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #ccc;
        outline: none;
        border-radius: 20px;
    }
    #send-btn {
        border-radius: 20px;
        padding: 10px 18px;
        margin-left: 10px;
        border: none;
        cursor: pointer;
        color: #fff;
        background: #0078ff;
    }
```

### 3、 javascript代码展示

```javascript
	const COZE_API_URL = "https://api.coze.cn/v3/chat";  // 智能体api
    const COZE_API_URL2 = "https://api.coze.cn/v3/chat/retrieve";  // 查询智能体回复状态api
    const COZE_API_URL3 = "https://api.coze.cn/v3/chat/message/list";  // 查询智能体回复api
    const BOT_ID = "YOUR_BOT_ID"  // 替换为你的BOT_ID
    const TOKEN = "YOUR_TOKEN"; // 替换为你的TOKEN

    // 获取DOM元素
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    // 添加消息到聊天框
    function addMessageToChatBox(message, isUser = false) {
        const messageElement = document.createElement("div");
        messageElement.display = "inline-block";
        messageElement.style.maxWidth = "75%";
        messageElement.style.lineHeight = "1.5";
        messageElement.style.wordWrap = "break-word";
        messageElement.style.whiteSpace = "pre-wrap";
        messageElement.textContent = message;
        messageElement.style.marginBottom = "12px";
        messageElement.style.padding = "10px 14px";
        messageElement.style.color = isUser ? "#fff" : "#000";
        messageElement.style.background = isUser ? "#0078ff" : "#e5e5ea";
        messageElement.style.borderRadius = isUser ? "16px 16px 0 16px" : "16px 16px 16px 0";
        messageElement.style.alignSelf = isUser ? "flex-end" : "flex-start";
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // 滚动到底部
    }

    // 发送消息到Coze API
    async function sendMessageToCoze(message) {
        try {
            const response = await fetch(COZE_API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bot_id: BOT_ID,
                    "user_id": "123",
                    stream: false,
                    auto_save_history: true,
                    additional_messages: [
                        {
                            role: "user",
                            "type": "question",
                            content: message,
                            content_type: "text",
                        },
                    ],
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    function requestMessage(data) {
        const url = `${COZE_API_URL3}?conversation_id=${data.conversation_id}&chat_id=${data.id}`;
        fetch(url, {
            method: "get",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
        })
        .then(res => res.json())
        .then(res => {
            if(res.code !== 0) {
                addMessageToChatBox(`coze: ${res.msg}`);
                sendBtn.disabled = false;
            }else {
                const msgData = res.data.find(item => item.type === 'answer');
                addMessageToChatBox(`coze: ${msgData.content}`);
                sendBtn.disabled = false;
            }
        })
    }

    let timer = null;
    function pollingApi(data) {
        timer = setInterval(() => {
            const url = `${COZE_API_URL2}?conversation_id=${data.conversation_id}&chat_id=${data.id}`;
            fetch(url, {
                method: "get",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
            })
            .then(res => res.json())
            .then(res => {
                if(res.code !== 0) {
                    addMessageToChatBox(`coze: ${res.msg}`);
                    sendBtn.disabled = false;
                    clearInterval(timer);
                    return
                }
                if(res.data.status === 'completed') {
                    clearInterval(timer);
                    requestMessage(res.data)
                }
            })
        },1000)
    }

    // 处理发送按钮点击事件
    sendBtn.addEventListener("click", async () => {
        const userMessage = userInput.value.trim();
        if (!userMessage) return; // 如果输入为空，直接返回

        // 显示用户消息
        addMessageToChatBox(`你: ${userMessage}`, true);

        // 清空输入框
        userInput.value = "";

        // 发送消息到扣子智能体并显示回复
        try {
            sendBtn.disabled = true;
            const response = await sendMessageToCoze(userMessage);
            if (response.code === 0) {
                pollingApi(response.data)
            } else {
                addMessageToChatBox(`coze: ${response.msg}`);
                sendBtn.disabled = false;
            }
        } catch (error) {
            sendBtn.disabled = false;
            addMessageToChatBox("coze: 抱歉，出错了，请稍后再试。");
        }
    });

    // 允许按回车键发送消息
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendBtn.click();
        }
    });
```


### 4、效果图

![在这里插入图片描述](/imgs/20250929190117.png)