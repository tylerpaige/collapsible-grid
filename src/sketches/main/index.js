import './styles.scss';
import clamp from '../../util/clamp';
import { fromEvent, merge } from 'rxjs';
import { takeUntil, mergeMap, map, switchMap } from 'rxjs/operators';

const state = {
  quadrant : false
};

const getMouseObservables = el => {
  return ['mousedown', 'mousemove', 'mouseup'].map(event => {
    //TODO: mouseup events should be on document, not el
    return fromEvent(el, event).pipe(
      map(e => ({
        x: e.clientX,
        y: e.clientY
      }))
    );
  });
};

const getTouchObservables = el => {
  return ['touchstart', 'touchmove', 'touchend'].map(event => {
    return fromEvent(el, event).pipe(
      map(e => {
        // if (e.type === 'touchend') {
        //   console.log(e);
        // }
        return({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        })
      })
    );
  });
};


const getObservables = (el, pages) => {
  const [mousedown$, mousemove$, mouseup$] = getMouseObservables(el);

  const [touchstart$, touchmove$, touchend$] = getTouchObservables(el);

  const start$ = merge(mousedown$, touchstart$);
  const move$ = merge(mousemove$, touchmove$);
  const end$ = merge(mouseup$, touchend$);

  const drag$ = start$.pipe(
    switchMap(e => {
      const startingX = e.x;
      const startingY = e.y;
      const width = el.clientWidth;
      const height = el.clientHeight;

      return move$.pipe(
        map(m => {
          return {
            dx : (m.x - startingX) / width,
            dy : (m.y - startingY) / height
          };
        }),
        takeUntil(end$)
      );
    })
  );
  const reset$ = start$.pipe(
    switchMap(e => {
      const startingX = e.x;
      const startingY = e.y;
      const width = el.clientWidth;
      const height = el.clientHeight;

      return end$.pipe(
        map(e => {
          const dx = (e.x - startingX) / width;
          const dy = (e.y - startingY) / height;

          return {
            dx,
            dy
          }
        })
      )
    })
  );
  const pageClicks = [...pages].map(p => fromEvent(p, 'click'));
  const dismiss$ = merge(...pageClicks);
  return {
    drag$,
    reset$,
    dismiss$
  };
};

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
      outer: scale,
      inner: innerScale
    };
  });
};

const resetStep = (panels, deltaX, deltaY, descendingX, descendingY) => {
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
      resetStep(panels, x, y, descendingX, descendingY);
    });
  }
};

const goTo = (quadrant) => {
  if (typeof state.quadrant === 'number') {
    document.body.classList.remove(`page-${state.quadrant}`);
  }
  document.body.classList.add(`page-${quadrant}`);
  state.quadrant = quadrant;
};

const closePage = () => {
  if (typeof state.quadrant === 'number') {
    document.body.classList.remove(`page-${state.quadrant}`);
  }
  state.quadrant = false;
}

const init = () => {
  const root = document.getElementById('root');
  const panels = Array.from(root.querySelectorAll('.panel')).map(outer => {
    const inner = outer.querySelector('.panel__inner');
    return {
      outer,
      inner
    };
  });
  const pages = document.querySelectorAll('.page');
  const { drag$, reset$, dismiss$ } = getObservables(root, pages);
  drag$.subscribe(e => {
    const scales = deltaToScales(e.dx, e.dy);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale.outer.join(',')})`;
      panels[index].inner.style.transform = `scale(${scale.inner.join(',')})`;
    });
  });
  reset$.subscribe(e => {
    const descendingX = e.dx > 0;
    const descendingY = e.dy > 0;
    resetStep(panels, e.dx, e.dy, descendingX, descendingY);

    const scales = deltaToScales(e.dx, e.dy);
    /*
    ---------
    | 1 | 2 |
    |---|---|
    | 3 | 4 |
    ---------
    */
    const quadrant = scales.findIndex(s => s.outer[0] >= 1.5 && s.outer[1] >= 1.5);
    if (quadrant >= 0) {
      goTo(quadrant + 1);
    }

  });
  dismiss$.subscribe(e => {
    closePage();
  })
};

document.addEventListener('DOMContentLoaded', init);