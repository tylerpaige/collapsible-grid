import './styles.scss';
import roundTo from '../../util/round-to';
import clamp from '../../util/clamp';

const deltaToScales = (deltaX, deltaY) => {
  const growX = (deltaX / 0.5) + 1;
  const growY = (deltaY / 0.5) + 1;
  const shrinkX = 1 - (deltaX / 0.5);
  const shrinkY = 1 - (deltaY / 0.5);
  return [
    [growX, growY],
    [shrinkX, growY],
    [growX, shrinkY],
    [shrinkX, shrinkY]
  ].map(scale => {

    /*
    if the scaleX is larger than scaleY, 
    the inner has to grow taller to maintain the aspect ratio.
    
    if the scaleY is larger than scaleX,
    the inner has to grow wider to maintain the aspect ratio.
    */
    const innerScale = scale[0] > scale[1] 
      ? [1, scale[0] / scale[1]]
      : [scale[1] / scale[0], 1];
    return {
      outer : scale.join(','),
      inner : innerScale.join(',')
    };
  });
};


const init = () => {
  const root = document.getElementById('root');
  const panels = Array.from(root.querySelectorAll('.panel')).map(outer => {
    const inner = outer.querySelector('.panel__inner');
    return {
      outer,
      inner
    };
  });

  let START_X;
  let START_Y;
  let LAST_X;
  let LAST_Y;
  let RESET_DELAY;
  root.addEventListener('touchstart', e => {
    root.classList.remove('is-resetting');
    START_X = e.touches[0].clientX / root.clientWidth;
    START_Y = e.touches[0].clientY / root.clientHeight;
  });
  root.addEventListener('touchmove', (e) =>{
    const deltaX = (e.touches[0].clientX / root.clientWidth) - START_X;
    const deltaY = (e.touches[0].clientY / root.clientHeight) - START_Y;
    
    const scales = deltaToScales(deltaX, deltaY);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer})`;
      panels[index].inner.style.transform = `scale(${scale.inner})`;
    });

    LAST_X = deltaX;
    LAST_Y = deltaY;
  });
  const resetIncrement = 0.025;
  const resetStep = (deltaX, deltaY) => {
    //Doesn't really work for ones where delta is negative
    //Gotta do something with absolute values
    const x = deltaX - resetIncrement < 0 ? 0 : deltaX - resetIncrement;
    const y = deltaY - resetIncrement < 0 ? 0 : deltaY - resetIncrement;
    const scales = deltaToScales(x, y);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer})`;
      panels[index].inner.style.transform = `scale(${scale.inner})`;
    });


    if (x > 0 || y > 0) {
      requestAnimationFrame(() => {
        resetStep(x, y);
      });
    }
  };
  root.addEventListener('touchend', e => {
    resetStep(LAST_X, LAST_Y);
  });
};

document.addEventListener('DOMContentLoaded', init);