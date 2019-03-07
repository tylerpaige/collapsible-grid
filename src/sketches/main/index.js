import './styles.scss';
import roundTo from '../../util/round-to';
import clamp from '../../util/clamp';

const deltaToScales = (deltaX, deltaY) => {
  const growX = deltaX / 0.5 + 1;
  const growY = deltaY / 0.5 + 1;
  const shrinkX = 1 - deltaX / 0.5;
  const shrinkY = 1 - deltaY / 0.5;
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
      outer: scale.join(','),
      inner: innerScale.join(',')
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
    const deltaX = e.clientX / root.clientWidth - START_X;
    const deltaY = e.clientY / root.clientHeight - START_Y;

    const scales = deltaToScales(deltaX, deltaY);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer})`;
      panels[index].inner.style.transform = `scale(${scale.inner})`;
    });

    LAST_X = deltaX;
    LAST_Y = deltaY;
  };

  const resetIncrement = 0.05;
  const resetStep = (deltaX, deltaY, descendingX, descendingY) => {
    const targetX = descendingX
      ? deltaX - resetIncrement
      : deltaX + resetIncrement;
    const targetY = descendingY
      ? deltaY - resetIncrement
      : deltaY + resetIncrement;
    const extremaX = descendingX ? [0, 1] : [-1, 0];
    const extremaY = descendingY ? [0, 1] : [-1, 0];

    const x = clamp(targetX, ...extremaX);
    const y = clamp(targetY, ...extremaY);

    const scales = deltaToScales(x, y);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer})`;
      panels[index].inner.style.transform = `scale(${scale.inner})`;
    });

    if (Math.abs(x) > 0 || Math.abs(y) > 0) {
      requestAnimationFrame(() => {
        resetStep(x, y, descendingX, descendingY);
      });
    }
  };

  root.addEventListener('touchstart', e => {
    // e.preventDefault();
    START_X = e.touches[0].clientX / root.clientWidth;
    START_Y = e.touches[0].clientY / root.clientHeight;
  });
  root.addEventListener('mousedown', e => {
    START_X = e.clientX / root.clientWidth;
    START_Y = e.clientY / root.clientHeight;

    root.addEventListener('mousemove', followMouse);
  });
  root.addEventListener('touchmove', e => {
    // e.preventDefault();
    const deltaX = e.touches[0].clientX / root.clientWidth - START_X;
    const deltaY = e.touches[0].clientY / root.clientHeight - START_Y;

    const scales = deltaToScales(deltaX, deltaY);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer})`;
      panels[index].inner.style.transform = `scale(${scale.inner})`;
    });

    LAST_X = deltaX;
    LAST_Y = deltaY;
  });
  root.addEventListener('touchend', e => {
    console.log({ LAST_X, LAST_Y });
    const descendingX = LAST_X > 0;
    const descendingY = LAST_Y > 0;

    resetStep(LAST_X, LAST_Y, descendingX, descendingY);
  });
  document.addEventListener('mouseup', e => {
    resetStep(LAST_X, LAST_Y);
    root.removeEventListener('mousemove', followMouse);
  });
};

document.addEventListener('DOMContentLoaded', init);
