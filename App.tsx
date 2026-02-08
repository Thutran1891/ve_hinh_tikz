import React, { useState, useEffect } from 'react';
import { 
  Calculator, Moon, Sun, Copy, Download, Trash2, 
  Sigma, Box, PenTool, LayoutTemplate, Palette,
  Image as ImageIcon, Loader2, Wand2, Sparkles,
  Eye, X, Lightbulb, FlaskConical, Atom
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Button } from './components/Button';
import { Input } from './components/Input';
import { generateBBT, generateGraph, generateGeometry, generateCustomGraphCode } from './utils/latexGenerator';
import { compileTikzToImage, extractTikzCode } from './utils/api';
import { AppTab, FunctionType, GeometryType, Coefficients, GeoParams } from './types';

const AI_SAMPLES = {
  [AppTab.AI_DRAW]: [
    { label: 'Tam giác & Đường cao', prompt: 'Vẽ tam giác ABC vuông tại A, có đường cao AH. Ký hiệu góc vuông tại A và H.' },
    { label: 'Hình bình hành', prompt: 'Vẽ hình bình hành ABCD có A(1,3), B(6,3), D(0,0). Vẽ các cạnh và gắn nhãn các đỉnh.' },
    { label: 'Hình chóp tam giác', prompt: 'Vẽ hình chóp tam giác đều S.ABC, đường cao SO, cạnh đáy bằng 4, chiều cao bằng 4. Ký hiệu các cạnh bằng nhau.' },
    { label: 'Đồ thị bậc hai', prompt: 'Vẽ đồ thị y = x^2 + 2x - 3. Có trục tọa độ, vạch chia Ox, Oy và đường gióng dashed.' },
    { label: 'Bảng biến thiên', prompt: 'Vẽ bảng biến thiên cho hàm số bậc ba y = x^3 + 3x^2 - 4.' }
  ],
  [AppTab.CHEMISTRY]: [
    { label: 'Cụm nguyên tử 3D', prompt: 'Vẽ mô hình cluster nguyên tử 3D với 3 lớp cầu: lớp dưới màu đỏ, lớp giữa màu vàng, lớp trên màu xám.' },
    { label: 'Màng Lipid kép', prompt: 'Vẽ màng lipid kép (bilayer membrane) với các đầu đỏ và đuôi xám.' },
    { label: 'Cấu trúc Benzene', prompt: 'Vẽ vòng benzene sử dụng chemfig với các liên kết đôi xen kẽ.' }
  ]
};

const defaultCoeffs: Coefficients = { a: 1, b: -2, c: 1, d: 1, m: 1, n: 0 };
const defaultGeo: GeoParams = { 
  A: 'A', B: 'B', C: 'C', D: 'D', 
  S: 'S', M: 'M', N: 'N', P: 'P', Q: 'Q', 
  R: 2, h: 3 
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.BBT);
  const [funcType, setFuncType] = useState<FunctionType>(FunctionType.QUADRATIC);
  const [geoType, setGeoType] = useState<GeometryType>(GeometryType.TETRAHEDRON);
  
  const [coeffs, setCoeffs] = useState<Coefficients>(defaultCoeffs);
  const [geoParams, setGeoParams] = useState<GeoParams>(defaultGeo);
  const [customGraph, setCustomGraph] = useState({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, hsf: '(x)^2', gtx: '', gty: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleCoeffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoeffs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const generate = () => {
    let result = '';
    if (activeTab === AppTab.BBT) result = generateBBT(funcType, coeffs);
    else if (activeTab === AppTab.GRAPH) result = generateGraph(funcType, coeffs);
    else if (activeTab === AppTab.GEOMETRY) result = generateGeometry(geoType, geoParams);
    else if (activeTab === AppTab.CUSTOM_GRAPH) result = generateCustomGraphCode(customGraph);
    setOutput(result);
  };

  const handleCompile = async (isDownload = false) => {
    if (!output) return;
    const tikzCode = extractTikzCode(output);
    if (!tikzCode) {
      alert("Không tìm thấy mã TikZ hợp lệ.");
      return;
    }
    setIsCompiling(true);
    try {
      const result = await compileTikzToImage(tikzCode);
      if (result.success && result.image) {
        if (isDownload) {
          const link = document.createElement('a');
          link.href = `data:image/png;base64,${result.image}`;
          link.download = `latex_export_${Date.now()}.png`;
          link.click();
        } else {
          setPreviewImage(result.image);
        }
      } else {
        alert("Lỗi biên dịch: " + result.error);
      }
    } catch (error: any) {
      alert("Lỗi kết nối: " + error.message);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Yêu cầu: ${aiPrompt}`,
        config: {
          systemInstruction: `Bạn là chuyên gia TikZ LaTeX. Vẽ hình toán học/khoa học. Luôn bao bọc mã trong \\begin{tikzpicture} và \\end{tikzpicture}.`
        }
      });
      const rawText = response.text || '';
      const codeMatch = rawText.match(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/);
      setOutput(codeMatch ? codeMatch[0] : rawText);
    } catch (error: any) {
      alert("Lỗi AI: " + error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Calculator className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-200 uppercase tracking-tight">
              Science TikZ Studio
            </h1>
          </div>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Tab Navigation */}
            <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-700">
              {[
                { id: AppTab.BBT, icon: Sigma, label: 'BBT' },
                { id: AppTab.GRAPH, icon: LayoutTemplate, label: 'Đồ Thị' },
                { id: AppTab.GEOMETRY, icon: Box, label: 'Hình KG' },
                { id: AppTab.CHEMISTRY, icon: Atom, label: 'Hóa/Sinh' },
                { id: AppTab.CUSTOM_GRAPH, icon: PenTool, label: 'Tự Vẽ' },
                { id: AppTab.AI_DRAW, icon: Wand2, label: 'Vẽ AI' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-4 gap-1 transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-teal-500 text-teal-600 bg-teal-50/30 dark:bg-teal-900/10' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selectors */}
              {(activeTab === AppTab.BBT || activeTab === AppTab.GRAPH) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">Loại hàm số</label>
                  <select 
                    value={funcType} 
                    onChange={(e) => setFuncType(e.target.value as FunctionType)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none transition-all font-medium text-sm"
                  >
                    <option value={FunctionType.LINEAR}>Hàm bậc nhất (ax + b)</option>
                    <option value={FunctionType.QUADRATIC}>Hàm bậc hai (ax² + bx + c)</option>
                    <option value={FunctionType.CUBIC}>Hàm bậc ba (ax³ + bx² + cx + d)</option>
                    <option value={FunctionType.QUARTIC}>Hàm trùng phương (ax⁴ + bx² + c)</option>
                    <option value={FunctionType.RATIONAL_1_1}>Hàm phân thức (ax+b)/(cx+d)</option>
                    <option value={FunctionType.RATIONAL_2_1}>Hàm phân thức (ax²+bx+c)/(mx+n)</option>
                  </select>
                </div>
              )}

              {activeTab === AppTab.GEOMETRY && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">Loại hình học</label>
                  <select 
                    value={geoType} 
                    onChange={(e) => setGeoType(e.target.value as GeometryType)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none transition-all font-medium text-sm"
                  >
                    <option value={GeometryType.TETRAHEDRON}>Tứ diện / Hình chóp</option>
                    <option value={GeometryType.PRISM}>Lăng trụ đứng</option>
                    <option value={GeometryType.RECTANGULAR_PRISM}>Hình hộp / Hình lập phương</option>
                    <option value={GeometryType.CONE}>Khối nón</option>
                    <option value={GeometryType.CYLINDER}>Khối trụ</option>
                    <option value={GeometryType.SPHERE}>Khối cầu</option>
                  </select>
                </div>
              )}

              {/* Dynamic Inputs for Coefficients */}
              {(activeTab === AppTab.BBT || activeTab === AppTab.GRAPH) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Input label="a =" name="a" type="number" value={coeffs.a} onChange={handleCoeffChange} />
                  <Input label="b =" name="b" type="number" value={coeffs.b} onChange={handleCoeffChange} />
                  
                  {/* Hiện c cho: Bậc 2 trở lên, trùng phương, 1/1, 2/1 */}
                  {funcType !== FunctionType.LINEAR && (
                    <Input label="c =" name="c" type="number" value={coeffs.c} onChange={handleCoeffChange} />
                  )}
                  
                  {/* Hiện d cho: Bậc 3, 1/1, 2/1 */}
                  {(funcType === FunctionType.CUBIC || funcType === FunctionType.RATIONAL_1_1 || funcType === FunctionType.RATIONAL_2_1) && (
                    <Input label="d =" name="d" type="number" value={coeffs.d} onChange={handleCoeffChange} />
                  )}
                  
                  {/* Hiện m, n cho 2/1 */}
                  {funcType === FunctionType.RATIONAL_2_1 && (
                    <>
                      <Input label="m =" name="m" type="number" value={coeffs.m} onChange={handleCoeffChange} />
                      <Input label="n =" name="n" type="number" value={coeffs.n} onChange={handleCoeffChange} />
                    </>
                  )}
                </div>
              )}

              {activeTab === AppTab.GEOMETRY && (
                <div className="grid grid-cols-2 gap-4">
                  {(geoType === GeometryType.CONE || geoType === GeometryType.CYLINDER || geoType === GeometryType.SPHERE) ? (
                    <>
                      <Input label="Bán kính R =" type="number" value={geoParams.R} onChange={(e) => setGeoParams(p => ({...p, R: parseFloat(e.target.value) || 0}))} />
                      {geoType !== GeometryType.SPHERE && (
                        <Input label="Chiều cao h =" type="number" value={geoParams.h} onChange={(e) => setGeoParams(p => ({...p, h: parseFloat(e.target.value) || 0}))} />
                      )}
                    </>
                  ) : (
                    <div className="col-span-2 text-xs text-slate-500 italic">Gợi ý: Các đỉnh (A, B, C...) sẽ tự động được gán nhãn trong mã TikZ.</div>
                  )}
                </div>
              )}

              {activeTab === AppTab.CUSTOM_GRAPH && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="xmin =" type="number" value={customGraph.xmin} onChange={(e) => setCustomGraph(p => ({...p, xmin: parseFloat(e.target.value) || 0}))} />
                    <Input label="xmax =" type="number" value={customGraph.xmax} onChange={(e) => setCustomGraph(p => ({...p, xmax: parseFloat(e.target.value) || 0}))} />
                  </div>
                  <Input label="Hàm f(x) =" value={customGraph.hsf} onChange={(e) => setCustomGraph(p => ({...p, hsf: e.target.value}))} />
                </div>
              )}

              {/* AI Section */}
              {(activeTab === AppTab.AI_DRAW || activeTab === AppTab.CHEMISTRY) && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {AI_SAMPLES[activeTab]?.map((sample, i) => (
                      <button 
                        key={i} 
                        onClick={() => setAiPrompt(sample.prompt)}
                        className="px-3 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full hover:border-teal-500 transition-colors"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Mô tả hình ảnh bạn muốn vẽ (ví dụ: vẽ lăng trụ tam giác đều...)"
                    className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-teal-500 outline-none"
                  />
                  <Button fullWidth onClick={handleAIGenerate} disabled={isAiLoading} className="h-12 shadow-teal-500/20">
                    {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Tạo bằng AI
                  </Button>
                </div>
              )}

              {activeTab !== AppTab.AI_DRAW && activeTab !== AppTab.CHEMISTRY && (
                <Button fullWidth onClick={generate} className="h-12 shadow-teal-500/20">
                  <Palette className="w-5 h-5" /> Tạo Mã LaTeX
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col min-h-[500px] overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200 uppercase text-xs tracking-widest">
                <PenTool className="w-4 h-4 text-teal-500" /> Mã TikZ Kết Quả
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" className="h-8 w-8 !p-0" onClick={() => {
                  navigator.clipboard.writeText(output);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}>
                  {isCopied ? <div className="text-[10px] font-bold text-teal-500">OK</div> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" className="h-8 w-8 !p-0" onClick={() => setOutput('')}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
            
            <textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="flex-1 w-full p-6 font-mono text-sm bg-slate-50 dark:bg-slate-900 border-none resize-none focus:outline-none text-emerald-600 dark:text-emerald-400 custom-scrollbar"
              placeholder="Nhấn 'Tạo Mã' để xem kết quả tại đây..."
            />

            <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleCompile(false)} disabled={isCompiling || !output}>
                {isCompiling ? <Loader2 className="animate-spin w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Xem trước ảnh
              </Button>
              <Button variant="outline" onClick={() => handleCompile(true)} disabled={isCompiling || !output}>
                <Download className="w-4 h-4" />
                Tải ảnh PNG
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <ImageIcon className="text-teal-500" /> Hình ảnh hiển thị
              </h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 bg-white dark:bg-slate-900 flex items-center justify-center min-h-[400px] overflow-auto">
              <img 
                src={`data:image/png;base64,${previewImage}`} 
                alt="LaTeX Preview" 
                className="max-w-full max-h-[70vh] object-contain drop-shadow-xl"
              />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 flex justify-end">
              <Button onClick={() => handleCompile(true)}>
                <Download className="w-4 h-4" /> Tải về máy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
