import { useState, useRef } from 'react';
import { Button, Upload, Space } from 'tdesign-react';
import { FileAudio, Upload as UploadIcon, X, CheckCircle, XCircle } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  onTranscriptionRequest?: (file: File) => void;
}

export function AudioUploader({ onFileSelect, onTranscriptionRequest }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile || !onTranscriptionRequest) return;
    
    setIsTranscribing(true);
    setTranscriptionResult(null);
    
    try {
      // 调用后端转录接口
      const formData = new FormData();
      formData.append('audio', selectedFile);
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setTranscriptionResult(data.text);
      } else {
        setTranscriptionResult('转录失败，请重试。');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptionResult('转录服务暂时不可用。');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setTranscriptionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
        id="audio-upload"
      />
      
      {!selectedFile ? (
        <label
          htmlFor="audio-upload"
          className="flex flex-col items-center justify-center cursor-pointer py-6"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
            <FileAudio size={28} className="text-white" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            点击上传音频文件
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            支持 MP3、WAV、M4A 格式，最大 100MB
          </p>
        </label>
      ) : (
        <div className="space-y-4">
          {/* 文件信息 */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FileAudio size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* 转录按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              theme="primary"
              className="flex-1"
              icon={<FileAudio size={16} />}
            >
              {isTranscribing ? '转录中...' : '开始转录'}
            </Button>
          </div>

          {/* 转录结果 */}
          {transcriptionResult && (
            <div className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  转录结果
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {transcriptionResult}
              </p>
              <Button
                size="small"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(transcriptionResult);
                }}
              >
                复制文本
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AudioUploader;
