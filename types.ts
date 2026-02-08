export enum FunctionType {
  LINEAR = 'bac_nhat',
  QUADRATIC = 'bac_hai',
  CUBIC = 'bac_ba',
  QUARTIC = 'trung_phuong', // Bậc 4 trùng phương
  RATIONAL_1_1 = 'mot_mot', // (ax+b)/(cx+d)
  RATIONAL_2_1 = 'hai_mot', // (ax^2+bx+c)/(mx+n)
}

export enum GeometryType {
  TETRAHEDRON = 'tu_dien',
  CONE = 'khoi_non',
  CYLINDER = 'khoi_tru',
  SPHERE = 'khoi_cau',
  PRISM = 'lang_tru_dung',
  RECTANGULAR_PRISM = 'hinh_hop'
}

export enum AppTab {
  BBT = 'bbt',
  GRAPH = 'graph',
  GEOMETRY = 'geometry',
  CUSTOM_GRAPH = 'custom_graph',
  AI_DRAW = 'ai_draw',
  CHEMISTRY = 'chemistry'
}

export interface Coefficients {
  a: number;
  b: number;
  c: number;
  d: number;
  m: number;
  n: number;
}

export interface GeoParams {
  // Points
  A: string; B: string; C: string; D: string; 
  S: string; M: string; N: string; P: string; Q: string;
  // Dimensions
  R: number; h: number;
}