import './styles.scss';
import * as Rx from 'rxjs';
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
  let TRACKING = false;

  /*
  ------------
  START EVENTS
  ------------
  */
  const mouseDown$ = Rx.fromEvent(document.documentElement, 'mousedown').map(
    e => ({
      x: e.clientX,
      y: e.clientY
    })
  );
  const touchStart$ = Rx.fromEvent(document.documentElement, 'touchstart').map(
    e => ({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
  );
  const start$ = Rx.Observable.merge(mouseDown$, touchStart$);

  start$.subscribe(({ x, y }) => {
    START_X = x / root.clientWidth;
    START_Y = y / root.clientHeight;
    TRACKING = true;
  });

  /*
  ------------
  MOVE EVENTS
  ------------
  */
  const mouseMove$ = Rx.fromEvent(document.documentElement, 'mousemove').map(
    event => ({
      x: event.clientX,
      y: event.clientY
    })
  );
  const touchMove$ = Rx.fromEvent(document.documentElement, 'touchmove').map(
    event => ({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    })
  );

  const move$ = Rx.Observable.merge(mouseMove$, touchMove$);
  move$.subscribe(({ x, y }) => {
    if (TRACKING) {
      const deltaX = x / root.clientWidth - START_X;
      const deltaY = y / root.clientHeight - START_Y;

      const scales = deltaToScales(deltaX, deltaY);
      scales.forEach((scale, index) => {
        panels[index].outer.style.transform = `scale(${scale.outer})`;
        panels[index].inner.style.transform = `scale(${scale.inner})`;
      });

      LAST_X = deltaX;
      LAST_Y = deltaY;
    }
  });

  /*
  -------------
  RESET EVENTS
  -------------
  */
  const mouseUp$ = Rx.fromEvent(document.documentElement, 'mouseup');
  const touchEnd$ = Rx.fromEvent(document.documentElement, 'touchend');
  const end$ = Rx.Observable.merge(mouseUp$, touchEnd$);

  end$.subscribe(() => {
    const descendingX = LAST_X > 0;
    const descendingY = LAST_Y > 0;

    resetStep(LAST_X, LAST_Y, descendingX, descendingY);

    TRACKING = false;
  });

  const resetStep = (deltaX, deltaY, descendingX, descendingY) => {
    const resetIncrement = 0.05;
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
};

document.addEventListener('DOMContentLoaded', init);
