import roundTo from '../../../util/round-to';

const goTo = (state, quadrant, page) => {
  if (typeof state.quadrant === 'number') {
    document.body.classList.remove(`page-${state.quadrant}`);
  }
  document.body.classList.add(`page-${quadrant}`);

  const square = page.square;
  /*  
  sW * x = wW
  sH * y = wH
  */
  const scaleX = roundTo(window.innerWidth / square.clientWidth, 2);
  const scaleY = roundTo(window.innerHeight / square.clientHeight, 2);
  const scale = Math.max(scaleX, scaleY)
  square.style.transform = `scale(${scale})`;
  state.quadrant = quadrant;
};

const closePage = (state, pages) => {
  if (typeof state.quadrant === 'number') {
    document.body.classList.remove(`page-${state.quadrant}`);
    pages[state.quadrant - 1].square.style.transform = '';
  }
  state.quadrant = false;
};

export {
  goTo,
  closePage
}