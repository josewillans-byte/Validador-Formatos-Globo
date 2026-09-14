const FORMATOS = {
  frameAd: {
    nome: "FrameAd",
    grupo: "Frame Ad",
    largura: 1920,
    altura: 1080,
    pesoMaxKB: 990,
    extensoes: ["png", "jpg", "jpeg", "gif"],
    mime: ["image/png", "image/jpeg", "image/gif"],
    transparencia: "recomendada",
    areaLivre: "1280 × 720 px",
    observacoes: [
      "Área da arte: 1920 × 1080 px.",
      "Espaço livre/área de reprodução: 1280 × 720 px.",
      "Peso máximo: 990 KB.",
      "PNG é o formato recomendado; JPG/GIF podem ser aceitos conforme a regra do espaço livre.",
      "Não inserir QR Code: o elemento é gerado pela Globo.",
      "Não permite uso de TAG."
    ],
    overlay: "frameAd"
  },

  touchpointDesktop: {
    nome: "Touchpoint Desktop",
    grupo: "Touchpoint Imagético",
    largura: 1920,
    altura: 100,
    pesoMaxKB: null,
    extensoes: ["jpg", "jpeg", "png"],
    mime: ["image/jpeg", "image/png"],
    transparencia: "não aplicável",
    areaSegura: "740 px à esquerda",
    areaCorte: "1180 px à direita",
    observacoes: [
      "Dimensão: 1920 × 100 px.",
      "Área segura: 740 px à esquerda.",
      "Área de corte/elementos de interface: 1180 px à direita.",
      "Não aceita TAG.",
      "CTA é configurado no produto; limite de 10 caracteres."
    ],
    overlay: "touchpointDesktop"
  },

  touchpointMobile: {
    nome: "Touchpoint Mobile",
    grupo: "Touchpoint Imagético",
    largura: 430,
    altura: 140,
    pesoMaxKB: null,
    extensoes: ["jpg", "jpeg", "png"],
    mime: ["image/jpeg", "image/png"],
    transparencia: "não aplicável",
    areaSegura: "280 px à esquerda",
    areaCorte: "150 px à direita",
    observacoes: [
      "Dimensão: 430 × 140 px.",
      "Área segura: 280 px à esquerda.",
      "Área de corte/elementos de interface: 150 px à direita.",
      "Não aceita TAG.",
      "CTA é configurado no produto; limite de 10 caracteres."
    ],
    overlay: "touchpointMobile"
  },

  pauseAds: {
    nome: "Pause Ads",
    grupo: "Pause Ads",
    largura: 996,
    altura: 640,
    pesoMaxKB: 900,
    extensoes: ["png"],
    mime: ["image/png"],
    transparencia: "obrigatória",
    observacoes: [
      "Dimensão: 996 × 640 px.",
      "Peso máximo: 900 KB.",
      "Arquivo PNG.",
      "A arte deve ter fundo transparente para se integrar ao conteúdo.",
      "O QR Code é gerado pelo produto; não inserir na arte."
    ]
  },

  pauseAdsTakeover: {
    nome: "Pause Ads Takeover",
    grupo: "Pause Ads Takeover",
    largura: 1920,
    altura: 1080,
    pesoMaxKB: 900,
    extensoes: ["jpg", "jpeg"],
    mime: ["image/jpeg"],
    transparencia: "não aplicável",
    observacoes: [
      "Dimensão: 1920 × 1080 px.",
      "Peso máximo: 900 KB.",
      "Arquivo JPG/JPEG.",
      "Não inserir QR Code ou CTA na arte: esses elementos são gerados pelo produto.",
      "Na TV, respeitar as regiões reservadas para QR Code e thumbnail/vídeo."
    ],
    overlay: "pauseAdsTakeover"
  }
};
