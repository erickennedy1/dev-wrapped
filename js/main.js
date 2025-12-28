/**
 * MAIN.JS
 * Navegação entre seções e renderização de projetos
 */

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  renderProjects();
});

/**
 * Configura navegação entre seções com animação
 */
function setupNavigation() {
  // Botões que navegam para seções
  const navButtons = document.querySelectorAll('[data-section]');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.section;
      navigateToSection(targetId);
    });
  });
}

/**
 * Navega para uma seção específica
 */
function navigateToSection(targetId) {
  const currentSection = document.querySelector('.section--active');
  const targetSection = document.getElementById(targetId);

  if (!targetSection || currentSection === targetSection) return;

  // Adiciona classe de saída na seção atual
  currentSection.classList.add('section--leaving');
  currentSection.classList.remove('section--active');

  // Após a animação de saída, ativa a nova seção
  setTimeout(() => {
    currentSection.classList.remove('section--leaving');
    targetSection.classList.add('section--active');

    // Anima os cards de projeto se estiver entrando na seção de projetos
    if (targetId === 'projects') {
      animateProjectCards();
    }
  }, 300);
}

/**
 * Anima os cards de projeto com delay escalonado
 */
function animateProjectCards() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card, index) => {
    card.classList.remove('animate-in');
    card.style.animationDelay = `${index * 0.1}s`;

    setTimeout(() => {
      card.classList.add('animate-in');
    }, 50);
  });
}

/**
 * Renderiza os cards de projeto na grid
 */
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map(project => `
    <a href="projeto.html?id=${project.id}" class="project-card">
      ${project.image
        ? `<img src="${project.image}" alt="${project.title}" class="project-image" onerror="this.outerHTML='<div class=\\'project-image-placeholder\\'>${project.icon}</div>'">`
        : `<div class="project-image-placeholder">${project.icon}</div>`
      }
      <div class="project-content">
        <h3 class="project-title">
          <span class="project-title-icon">${project.icon}</span>
          ${project.title}
        </h3>
        <p class="project-desc">${project.description}</p>
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
        </div>
        <div class="project-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </a>
  `).join('');
}
