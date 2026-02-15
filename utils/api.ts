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
];

const RENDER_API_URL = 'https://compile-tikz-code.onrender.com/compile';

export const extractTikzCode = (fullText: string): string | null => {
  console.log('🔍 [extractTikzCode] Đang trích xuất...');

  if (!fullText) {
    console.error('❌ [extractTikzCode] Input rỗng');
    return null;
  }

  // --- Bước 1: Tìm khối \begin{tikzpicture}...\end{tikzpicture} ---
  const tikzMatch = fullText.match(
    /\\begin\s*\{tikzpicture\}[\s\S]*?\\end\s*\{tikzpicture\}/
  );

  if (!tikzMatch) {
    console.error('❌ [extractTikzCode] Không tìm thấy \\begin{tikzpicture}');
    return null;
  }

  const tikzBlock = tikzMatch[0];
  const tikzStart = tikzMatch.index!;

  // --- Bước 2: Tìm các lệnh setup TRƯỚC \begin{tikzpicture} ---
  //   Ví dụ: \tdplotsetmaincoords{60}{120}
  //          \pgfplotsset{...}
  //          \definecolor{...}
  //          \tikzset{...}
  //          \def\... / \newcommand{...}
  const textBefore = fullText.substring(0, tikzStart);

  // Regex bắt các lệnh setup thường gặp trước tikzpicture
  const setupPatterns = [
    /\\tdplotsetmaincoords\s*\{[^}]*\}\s*\{[^}]*\}/g,        // tikz-3dplot
    /\\tdplotsetrotatedcoords\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}/g,
    /\\pgfplotsset\s*\{[^}]*\}/g,                              // pgfplots
    /\\definecolor\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}/g,     // xcolor
    /\\colorlet\s*\{[^}]*\}\s*\{[^}]*\}/g,
    /\\tikzset\s*\{[\s\S]*?\}(?=\s*(?:\\|$|\n))/g,             // tikzset
    /\\def\\[a-zA-Z]+\s*\{[^}]*\}/g,                           // \def
    /\\newcommand\s*\{[^}]*\}(?:\s*\[\d+\])?\s*\{[^}]*\}/g,   // \newcommand
    /\\usetikzlibrary\s*\{[^}]*\}/g,                           // extra tikz libs
  ];

  const setupCommands: string[] = [];
  for (const pattern of setupPatterns) {
    const matches = textBefore.match(pattern);
    if (matches) {
      setupCommands.push(...matches);
    }
  }

  let result: string;
  if (setupCommands.length > 0) {
    console.log('📐 [extractTikzCode] Tìm thấy setup commands:', setupCommands);
    result = setupCommands.join('\n') + '\n' + tikzBlock;
  } else {
    result = tikzBlock;
  }

  console.log('✅ [extractTikzCode] Trích xuất thành công!');
  return result;
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

  // Không gửi packages vì server BASE_PREAMBLE đã load sẵn tất cả
  // (tikz-3dplot, tkz-euclide, tkz-tab, pgfplots, v.v.)
  const requestBody = {
    source: source,
    mode: 'auto',
    format: 'png',
    density: 300,
    transparent: true,
    return_log: true,
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

      if (data.log) {
        const errorMatch = data.log.match(/^!.*$/m);
        if (errorMatch) {
          errorMessage = errorMatch[0];
        }
      }

      return {
        success: false,
        error: `${errorMessage}\n\n💡 Xem Console (F12) để biết chi tiết.`,
      };
    }

    console.log('✅ [SUCCESS] Biên dịch thành công!');
    console.log('🖼️ [SUCCESS] Image base64 length:', data.image_base64?.length);

    return { success: true, image: data.image_base64 };

  } catch (error: any) {
    console.error('💥 [EXCEPTION]:', error);
    return {
      success: false,
      error: `Lỗi kết nối: ${error.message}\n\n💡 Kiểm tra:\n- Server có đang chạy?\n- URL có đúng không?\n- Kết nối mạng?`,
    };
  }
};
