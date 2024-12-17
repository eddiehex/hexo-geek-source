// 移动端菜单切换
document.querySelector('.menu-toggle').addEventListener('click', function() {
  document.querySelector('.nav-links').classList.toggle('active');
});

// TOC 切换
document.querySelector('.toc-toggle')?.addEventListener('click', function() {
  document.querySelector('.toc-container')?.classList.toggle('active');
});

// 点击外部关闭菜单
document.addEventListener('click', function(e) {
  const navLinks = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');
  const tocContainer = document.querySelector('.toc-container');
  const tocToggle = document.querySelector('.toc-toggle');

  if (!e.target.closest('.nav-links') && !e.target.closest('.menu-toggle') && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
  }

  if (tocContainer && !e.target.closest('.toc-container') && !e.target.closest('.toc-toggle') && tocContainer.classList.contains('active')) {
    tocContainer.classList.remove('active');
  }
}); 