# Portfólio Eric Kennedy

## Estrutura de Arquivos

```
portfolio/
├── index.html              # Página principal
├── projeto.html            # Template página de projeto
├── css/
│   ├── style.css           # Estilos principais
│   └── project-page.css    # Estilos página de projeto
├── js/
│   ├── main.js             # Lógica página principal
│   ├── projects.js         # 👈 EDITE AQUI SEUS PROJETOS
│   └── project-page.js     # Lógica página de projeto
└── assets/
    └── images/
        └── projects/       # Imagens dos projetos
```

## Como Adicionar/Editar Projetos

1. Abra o arquivo `js/projects.js`
2. Adicione um novo objeto ao array `PROJECTS`:

```javascript
{
  id: "meu-projeto",                    // ID único (usado na URL)
  title: "Nome do Projeto",             // Nome exibido
  description: "Descrição curta...",    // Aparece no card
  icon: "🚀",                           // Emoji do projeto
  image: "assets/images/projects/meu-projeto.png",  // Capa (ou null)
  tags: ["React", "Node.js"],           // Tecnologias
  github: "https://github.com/...",     // Link do repo
  demo: "https://...",                  // Link demo (opcional)
  details: {
    fullDescription: `
      Descrição completa do projeto...
    `,
    features: [
      "Feature 1",
      "Feature 2"
    ],
    images: [
      "assets/images/projects/meu-projeto/screenshot1.png",
      "assets/images/projects/meu-projeto/screenshot2.png"
    ]
  }
}
```

## Como Adicionar Imagens

1. Crie uma pasta para o projeto: `assets/images/projects/nome-do-projeto/`
2. Adicione as imagens (PNG, JPG, WebP)
3. Atualize os paths no `projects.js`

### Imagem de capa
- Tamanho recomendado: 800x450px (16:9)
- Será usada no card e no topo da página

### Screenshots
- Tamanho recomendado: 1200x800px
- Serão exibidas na galeria com lightbox

## Deploy no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Vá em Settings > Pages
4. Selecione a branch `main` e pasta `/ (root)`
5. Seu site estará em `https://seuusername.github.io/repositorio/`

## Personalizações

### Trocar cores
Edite as variáveis CSS em `css/style.css`:

```css
:root {
  --accent: #6366f1;        /* Cor de destaque */
  --bg-primary: #0a0a0c;    /* Fundo principal */
  /* ... */
}
```

### Trocar fonte
Altere o Google Fonts no `<head>` e a variável `--font-main`

### Trocar música do Spotify
No `index.html`, substitua o ID da track no iframe:
```
src="https://open.spotify.com/embed/track/NOVO_ID_AQUI?theme=0"
```

---

Feito com 💜 por Eric Kennedy
