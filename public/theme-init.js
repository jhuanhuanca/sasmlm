try {
  if (localStorage.getItem('rexmlm.theme') !== 'light') {
    document.documentElement.classList.add('dark')
  }
} catch (e) {}
