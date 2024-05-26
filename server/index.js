const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require("fs")
const bodyParser = require('body-parser');
const OpenAI = require("openai");
const cors = require('cors');
const app = express();
const port = 5000;

const client = new OpenAI({
    apiKey: "sk-nwgNIuHomayfu62UwqnJa249YPcH0NPsVlFpaTKXjNgK3wQi",  
    baseURL: "https://api.moonshot.cn/v1",
});
var corsOptions = {
    origin: '*',
    credentials:true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.use(cors(corsOptions)).use((req,res,next)=>{
    console.log(req);
    res.setHeader('Access-Control-Allow-Origin',"*");
    next();
});
// 使用 express-fileupload 中间件处理文件上传
app.use(fileUpload({
    createParentPath: true,
    defParamCharset: "utf8", // 添加utf8编码
    limits: { fileSize: 50 * 1024 * 1024 } // 设置最大文件大小为50MB
}));
//app.use(express.json());
//app.use(bodyParser.json());
//app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/upload', async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('没有上传文件');
  }

  const file = req.files.file;
  const uploadPath = __dirname + '/uploads/' + file.name;
  
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    console.log('File uploaded successfully.');
  });
  const file_object = await client.files.create({
    //file: file.data, 
    file: fs.createReadStream(uploadPath), 
    purpose: "file-extract"
  });
  // 将文件上传到 Kimi API
  let file_content = await (await client.files.content(file_object.id)).text()
 
  console.log(file_content,req.body.chatMessage)
  var chatMessage=req.body.chatMessage===undefined? "请根据文件里对话内容整理一份详细的会议纪要":req.body.chatMessage
  console.log(chatMessage)
    // 把它放进请求中
    let messages = [
        {
            "role": "system",
            "content": file_content,
        },
        {"role": "user", "content": chatMessage},
    ]    
 
    const completion = await client.chat.completions.create({
        model: "moonshot-v1-32k",         
        messages: messages,
        temperature: 0.3
    });
    fs.access(uploadPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error('File not found.');
        }
    
        // 删除文件
        fs.unlink(uploadPath, (err) => {
          if (err) {
            console.error('Error deleting file.');
          }
    
          console.log('File deleted successfully.');
        });
      });
    console.log(completion.choices[0].message.content); 
    res.json({data:completion.choices[0].message.content})
  //res.send(completion.choices[0].message.content);
});

app.listen(port, () => {
  console.log(`服务器正在监听端口 ${port}`);
});