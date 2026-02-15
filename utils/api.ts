// Danh sách đầy đủ các gói thư viện
export const TIKZ_PACKAGES = [
  "tikz",
  "pgfplots",
  "xcolor",
  "amsmath",
  "amssymb",
  "calc",
  "decorations.pathreplacing",
  "arrows.meta",
  "patterns",
  "shapes.geometric",
  "positioning",
  "tkz-tab",
  "tkz-euclide",
  "tikz-3dplot",
  "tkz-linknodes",
  "graphicx",
  "tabvar",
  "wasysym",
  "fancyhdr",
  "fillbetween",
  "compat=1.9",
];

const RENDER_API_URL = 'https://compile-tikz-code.onrender.com/compile';

export const extractTikzCode = (fullText: string): string | null => {
  console.log('🔍 [extractTikzCode] Đang trích xuất...');
  
  if (!fullText) {
    console.error('❌ [extractTikzCode] Input rỗng');
    return null;
  }
  
  const match = fullText.match(/\\begin\s*\{tikzpicture\}[\s\S]*?\\end\s*\{tikzpicture\}/);
  
  if (match) {
    console.log('✅ [extractTikzCode] Tìm thấy TikZ code!');
  } else {
    console.error('❌ [extractTikzCode] Không tìm thấy \\begin{tikzpicture}');
  }
  
  return match ? match[0] : null;
};

export interface CompileResult {
  success: boolean;
  image?: string;
  error?: string;
}

export const compileTikzToImage = async (source: string): Promise<CompileResult> => {
  console.log('🚀 [compileTikzToImage] BẮT ĐẦU BIÊN DỊCH');
  console.log('🌐 [compileTikzToImage] API URL:', RENDER_API_URL);
  console.log('📝 [compileTikzToImage] Source code:\n', source);
  
  // ✅ GIỐNG HTML - KHÔNG GỬI PACKAGES
  const requestBody = {
    source: source,
    mode: 'auto',
    format: 'png',
    density: 300,
    transparent: true,
    return_log: true  // Giữ để debug
    // ⚠️ BỎ packages: TIKZ_PACKAGES
  };
  
  console.log('📤 [compileTikzToImage] Request:', JSON.stringify(requestBody, null, 2));
  
  try {
    console.log('⏳ [compileTikzToImage] Đang gửi request...');
    
    const response = await fetch(RENDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📨 [Response] Status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📦 [Response] Data:', data);

    if (!response.ok || data.ok === false) {
      console.error('❌ [ERROR] Biên dịch thất bại');
      console.error('❌ [ERROR] Detail:', data.detail);
      
      if (data.log) {
        console.group('📋 [LATEX LOG]');
        console.log(data.log);
        console.groupEnd();
        
        // Tìm các dòng lỗi
        const errorLines = data.log.split('\n').filter((line: string) => 
          line.startsWith('!') || 
          line.toLowerCase().includes('error') ||
          line.includes('Undefined control sequence')
        );
        
        if (errorLines.length > 0) {
          console.error('🔍 [ERROR LINES]:', errorLines.join('\n'));
        }
      }
      
      let errorMessage = data.detail || 'Lỗi không xác định';
      
      // Trích xuất lỗi đầu tiên
      if (data.log) {
        const errorMatch = data.log.match(/^!.*$/m);
        if (errorMatch) {
          errorMessage = errorMatch[0];
        }
      }
      
      return { 
        success: false, 
        error: `${errorMessage}\n\n💡 Xem Console (F12) để biết chi tiết.` 
      };
    }

    console.log('✅ [SUCCESS] Biên dịch thành công!');
    console.log('🖼️ [SUCCESS] Image base64 length:', data.image_base64?.length);
    
    return { success: true, image: data.image_base64 };
    
  } catch (error: any) {
    console.error('💥 [EXCEPTION]:', error);
    return { 
      success: false, 
      error: `Lỗi kết nối: ${error.message}\n\n💡 Kiểm tra:\n- Server có đang chạy?\n- URL có đúng không?\n- Kết nối mạng?` 
    };
  }
};
