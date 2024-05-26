import React, { useState,useRef } from 'react';
const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reslut, setReslut] = useState<string>();
  const ref = useRef<HTMLDivElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('chatMessage', '请根据文件里对话内容整理一份详细的会议纪要');
      // 发送文件到后端
      // fetch 或者 axios 等方法发送文件给后端
      try {
        const url = 'http://localhost:5000/upload';
        
        
            setReslut('处理中。。。');
        
        fetch(url, {
            method: 'POST', // 设置请求的方法（GET、POST等）
            //headers: {'Content-Type': 'application/json'}, // 设置请求头
            body: formData // 设置请求体（如果需要）
          }).then(response => response.json())
          .then(data => {

            console.log(data);
                setReslut(data.data);
            
          });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.error('No file selected.');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>上传文件</button>
      <div ref={ref} style={{ whiteSpace: 'pre-line' ,textAlign:'left'}}>{reslut}</div>
    </div>
  );
};

export default FileUpload;