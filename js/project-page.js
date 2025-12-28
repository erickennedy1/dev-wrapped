/**
 * PROJECT-PAGE.JS
 * Carrega e renderiza projeto individual baseado na URL
 */

document.addEventListener('DOMContentLoaded', () => {
  loadProject();
});

/**
 * Pega o ID do projeto da URL e carrega
 */
function loadProject() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  if (!projectId) {
    showError('Projeto não especificado');
    return;
  }

  const project = PROJECTS.find(p => p.id === projectId);

  if (!project) {
    showError('Projeto não encontrado');
    return;
  }

  renderProject(project);
  document.title = `${project.title} — Eric Kennedy`;
}

/**
 * Renderiza o conteúdo do projeto
 */
function renderProject(project) {
  const container = document.getElementById('projectContent');

  // Detecta se a imagem é vertical baseado no projeto
  const isVerticalImage = project.id === 'mk-beauty';

  container.innerHTML = `
    <!-- Header -->
    <header class="project-header">
      <h1 class="project-title">${project.title}</h1>
      <div class="project-tags">
        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <div class="project-main ${isVerticalImage ? 'project-main--split' : ''}">
      <!-- Imagem -->
      <div class="project-image-wrapper ${isVerticalImage ? 'project-image-wrapper--vertical' : ''}">
        ${project.image
          ? `<img src="${project.image}" alt="${project.title}" class="project-cover" onerror="this.outerHTML='<div class=\\'project-cover-placeholder\\'>${project.icon}</div>'">`
          : `<div class="project-cover-placeholder">${project.icon}</div>`
        }

        <!-- Links abaixo da imagem -->
        ${project.github || project.demo ? `
        <div class="project-links">
          ${project.github ? `
            <a href="${project.github}" target="_blank" class="project-link project-link--primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          ` : ''}
          ${project.demo ? `
            <a href="${project.demo}" target="_blank" class="project-link project-link--secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${project.demo.includes('itch.io') ? `
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                ` : `
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                `}
              </svg>
              ${project.demo.includes('itch.io') ? 'Download' : 'Teste aqui'}
            </a>
          ` : ''}
        </div>
        ` : ''}
      </div>

      <!-- Info ao lado (para imagens verticais) -->
      <div class="project-info">
        <!-- Descrição -->
        <section class="project-section">
          <h2 class="project-section-title">Sobre o Projeto</h2>
          <p class="project-description">${project.details.fullDescription.trim()}</p>
        </section>

        <!-- Features -->
        ${project.details.features && project.details.features.length > 0 ? `
          <section class="project-section">
            <h2 class="project-section-title">Funcionalidades</h2>
            <ul class="project-features">
              ${project.details.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </section>
        ` : ''}
      </div>
    </div>

    <!-- Galeria -->
    ${project.details.images && project.details.images.length > 0 ? `
      <section class="project-section">
        <h2 class="project-section-title">Screenshots</h2>
        <div class="project-gallery">
          ${project.details.images.map((img, i) => `
            <div class="gallery-item" onclick="openLightbox('${img}')">
              <img src="${img}" alt="Screenshot ${i + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;
}

/**
 * Mostra erro quando projeto não existe
 */
function showError(message) {
  const container = document.getElementById('projectContent');
  container.innerHTML = `
    <div class="error-container">
      <div class="error-icon">🔍</div>
      <h1 class="error-title">${message}</h1>
      <p class="error-message">O projeto que você procura não foi encontrado.</p>
      <a href="index.html" class="project-link project-link--primary">
        Voltar ao início
      </a>
    </div>
  `;
}

/**
 * Abre lightbox com imagem
 */
function openLightbox(imageSrc) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImage');
  img.src = imageSrc;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Fecha lightbox
 */
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// Fecha lightbox com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
