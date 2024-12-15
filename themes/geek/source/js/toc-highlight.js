document.addEventListener('DOMContentLoaded', function() {
  const toc = document.querySelector('.toc-content');
  if (!toc) return;

  const tocLinks = toc.querySelectorAll('a');
  const sections = [];

  // 收集所有文章内容中的标题元素
  const articleContent = document.querySelector('.page-body');
  if (!articleContent) return;

  const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  // 确保标题有 id
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
    
    // 查找对应的 TOC 链接
    const link = toc.querySelector(`a[href="#${heading.id}"]`);
    if (link) {
      sections.push({
        id: heading.id,
        element: heading,
        link: link
      });
    }
  });

  // 添加平滑滚动
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        // 考虑固定导航栏的高度
        const navHeight = 80; // 根据实际导航栏高度调整
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  function highlightToc() {
    const scrollPosition = window.scrollY;
    const navHeight = 80; // 与上面的 navHeight 保持一致

    // 找到当前可见的章节
    let currentSection = null;
    let minDistance = Infinity;

    sections.forEach(section => {
      const sectionTop = section.element.getBoundingClientRect().top + window.pageYOffset;
      const distance = Math.abs(sectionTop - scrollPosition - navHeight);
      
      if (distance < minDistance) {
        minDistance = distance;
        currentSection = section;
      }
    });

    // 更新活动状态
    tocLinks.forEach(link => link.classList.remove('active'));
    if (currentSection && currentSection.link) {
      currentSection.link.classList.add('active');
      
      // 确保当前活动项在视图中
      const tocContainer = toc.parentElement;
      const linkRect = currentSection.link.getBoundingClientRect();
      const containerRect = tocContainer.getBoundingClientRect();
      
      if (linkRect.bottom > containerRect.bottom) {
        tocContainer.scrollTop += linkRect.bottom - containerRect.bottom;
      } else if (linkRect.top < containerRect.top) {
        tocContainer.scrollTop -= containerRect.top - linkRect.top;
      }
    }
  }

  // 使用 Intersection Observer 来优化滚动检测
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        highlightToc();
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-80px 0px -20% 0px' // 调整观察区域
  });

  // 观察所有标题元素
  headings.forEach(heading => observer.observe(heading));

  // 仍然保留滚动事件作为备份
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        highlightToc();
        ticking = false;
      });
      ticking = true;
    }
  });

  // 初始化高亮
  highlightToc();
}); 