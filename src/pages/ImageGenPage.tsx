import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Loader2, Download, Copy, Check, X, RefreshCw } from 'lucide-react';

interface ImageGenPageProps {
  onSelectTool?: (prompt: string) => void;
}

interface GenerationState {
  status: 'idle' | 'submitting' | 'polling' | 'completed' | 'error';
  jobId?: string;
  images: string[];
  error?: string;
  progress: string;
}

const SIZE_OPTIONS = [
  { label: '1:1', value: '1024:1024', desc: '1024×1024' },
  { label: '16:9', value: '1280:720', desc: '横版' },
  { label: '9:16', value: '720:1280', desc: '竖版' },
];

const STYLE_PRESETS = [
  { label: '写实', prompt: 'photorealistic, detailed, high quality' },
  { label: '插画', prompt: 'illustration, digital art, vibrant colors' },
  { label: '水彩', prompt: 'watercolor painting, soft colors' },
  { label: '动漫', prompt: 'anime style, manga' },
];

export function ImageGenPage({ onSelectTool }: ImageGenPageProps) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState('1024:1024');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [refImage, setRefImage] = useState('');
  const [copied, setCopied] = useState(false);
  const [generation, setGeneration] = useState<GenerationState>({
    status: 'idle',
    images: [],
    progress: '',
  });

  useEffect(() => {
    if (generation.status !== 'polling' || !generation.jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/image/query/${generation.jobId}`);
        const data = await res.json();

        if (data.success) {
          if (data.status === 'completed') {
            setGeneration(prev => ({ ...prev, status: 'completed', images: data.images || [], progress: '生成完成！' }));
            clearInterval(pollInterval);
          } else if (data.status === 'failed') {
            setGeneration(prev => ({ ...prev, status: 'error', error: '生成失败', progress: '' }));
            clearInterval(pollInterval);
          } else {
            setGeneration(prev => ({ ...prev, progress: data.message || '处理中...' }));
          }
        }
      } catch (error) {
        setGeneration(prev => ({ ...prev, status: 'error', error: '网络错误', progress: '' }));
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [generation.status, generation.jobId]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const finalPrompt = selectedStyle ? `${prompt.trim()}, ${selectedStyle}` : prompt.trim();

    setGeneration({ status: 'submitting', images: [], progress: '正在提交任务...' });

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, size: selectedSize, imageUrl: refImage.trim() || undefined }),
      });
      const data = await res.json();

      if (data.success) {
        setGeneration(prev => ({ ...prev, status: 'polling', jobId: data.jobId, progress: '等待生成...' }));
      } else {
        setGeneration({ status: 'error', images: [], error: data.error || '提交失败', progress: '' });
      }
    } catch (error: any) {
      setGeneration({ status: 'error', images: [], error: error.message || '网络错误', progress: '' });
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `news-agent-image-${index + 1}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isGenerating = generation.status === 'submitting' || generation.status === 'polling';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Wand2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI 生图创作</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">基于腾讯混元大模型</p>
              </div>
            </div>
            <button onClick={() => navigate('/tools')} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-2">
              <X size={18} />返回工具台
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述图片内容</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：一只橘猫坐在窗台上，阳光洒在毛发上..."
                className="w-full h-36 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">风格</label>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.label}
                    onClick={() => setSelectedStyle(selectedStyle === style.prompt ? null : style.prompt)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedStyle === style.prompt ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-50'}`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">尺寸</label>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${selectedSize === size.value ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                  >
                    {size.label} ({size.desc})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">参考图片 URL <span className="text-gray-400">(可选)</span></label>
              <input
                type="url"
                value={refImage}
                onChange={(e) => setRefImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
              {isGenerating ? generation.progress : '生成图片'}
            </button>

            {generation.error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {generation.error}
              </div>
            )}
          </div>

          {/* 结果区域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">生成结果</label>
            <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center overflow-hidden">
              {generation.status === 'idle' && (
                <div className="text-center text-gray-400">
                  <Wand2 size={48} className="mx-auto mb-3 opacity-30" />
                  <p>生成的图片将显示在这里</p>
                </div>
              )}
              {isGenerating && (
                <div className="text-center">
                  <Loader2 size={48} className="animate-spin mx-auto mb-3 text-purple-500" />
                  <p className="text-gray-500">{generation.progress}</p>
                </div>
              )}
              {generation.status === 'completed' && generation.images.length > 0 && (
                <div className="w-full h-full relative group">
                  <img src={generation.images[0]} alt="Generated" className="w-full h-full object-contain" />
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDownload(generation.images[0], 0)} className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-white transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageGenPage;
