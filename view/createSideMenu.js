module.exports = createSideMenu;

function createSideMenu(dom) {
  var isVisible = false;
  var toggleClass = 'toggle-sidebar';

  dom.addEventListener('mousedown', sidebarHook);
  var sidebarContent = dom.querySelector('.global-sidebar');

  var backdrop;

  return {
    show: show,
    hide: hide,
    toggle: toggle
  };

  function show() {
    isVisible = true;
    createBackdrop();
    sidebarContent.classList.add('visible');
  }

  function hide() {
    isVisible = false;
    removeBackdrop();
    sidebarContent.classList.remove('visible');
  }

  function sidebarHook(e) {
    if (!e || !e.target) return;
    if (e.target.classList.contains(toggleClass)) {
      return toggle(e);
    }
  }

  function toggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isVisible) hide();
    else show();
  }

  function createBackdrop() {
    if (backdrop) removeBackdrop();
    backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');
    backdrop.classList.add(toggleClass);
    dom.appendChild(backdrop);
  }

  function removeBackdrop() {
    if (backdrop) {
      backdrop.removeEventListener('mousedown', toggle);
      dom.removeChild(backdrop);
    }
    backdrop = null;
  }
}
