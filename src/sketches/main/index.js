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
    const innerScale = scale.map(s => 1 / s);
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

  const followMouse = e => {
    const deltaX = (e.clientX / root.clientWidth) - START_X;
    const deltaY = (e.clientY / root.clientHeight) - START_Y;
    
    const scales = deltaToScales(deltaX, deltaY);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer})`;
      panels[index].inner.style.transform = `scale(${scale.inner})`;
    });

    LAST_X = deltaX;
    LAST_Y = deltaY;
  };

  const resetIncrement = 0.05;
  const resetStep = (deltaX, deltaY) => {
    //Doesn't really work for ones where delta is negative
    //Gotta do something with absolute values
    let x;
    let y;
    let needsMoreX = true;
    let needsMoreY = true;

    if (deltaX < 0) {
      x = deltaX + resetIncrement;
      if (x > 0) {
        needsMoreX = false;
        x = 0;
      }
    } else if (deltaX > 0) {
      x = deltaX - resetIncrement;
      if (x < 0) {
        needsMoreX = false;
        x = 0;
      }
    } else {
      needsMoreX = false;
      x = 0;
    }


    if (deltaY < 0) {
      y = deltaY + resetIncrement;
      if (y > 0) {
        needsMoreY = false;
        y = 0;
      }
    } else if (deltaY > 0) {
      y = deltaY - resetIncrement;
      if (y < 0) {
        needsMoreY = false;
        y = 0;
      }
    } else {
      needsMoreY = false;
      y = 0;
    }

    const scales = deltaToScales(x, y);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer})`;
      panels[index].inner.style.transform = `scale(${scale.inner})`;
    });


    if (needsMoreX || needsMoreY) {
      requestAnimationFrame(() => {
        resetStep(x, y);
      });
    }
  };


  root.addEventListener('touchstart', e => {
    START_X = e.touches[0].clientX / root.clientWidth;
    START_Y = e.touches[0].clientY / root.clientHeight;
  });
  root.addEventListener('mousedown', e => {
    START_X = e.clientX / root.clientWidth;
    START_Y = e.clientY / root.clientHeight;

    root.addEventListener('mousemove', followMouse);
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
  root.addEventListener('touchend', e => {
    resetStep(LAST_X, LAST_Y);
  });
  document.addEventListener('mouseup', e =>{

    resetStep(LAST_X, LAST_Y);
    root.removeEventListener('mousemove', followMouse);
  })
};

document.addEventListener('DOMContentLoaded', init);