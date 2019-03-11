// import * as Rx from 'rxjs';
import { fromEvent, merge } from 'rxjs';
import { takeUntil, mergeMap, map, switchMap } from 'rxjs/operators';

const getMouseObservables = el => {
  return ['mousedown', 'mousemove', 'mouseup'].map(event => {
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

const getObservables = el => {
  const [mousedown$, mousemove$, mouseup$] = getMouseObservables(el);

  const [touchstart$, touchmove$, touchend$] = getTouchObservables(el);

  const start$ = merge(mousedown$, touchstart$);
  const move$ = merge(mousemove$, touchmove$);
  const end$ = merge(mouseup$, touchend$);

  const drag$ = start$.pipe(
    switchMap(e => {
      const startingX = e.x;
      const startingY = e.x;

      return move$.pipe(
        map(m => {
          return {
            dx: m.x - startingX,
            dy: m.y - startingY
          };
        }),
        takeUntil(end$)
      );
    })
  );
  const reset$ = start$.pipe(
    switchMap(e => {
      const startingX = e.x;
      const startingY = e.x;
      return end$.pipe(
        map(e => {
          return {
            dx: e.x - startingX,
            dy: e.y - startingY
          }
        })
      )
    })
  );
  return {
    drag$,
    reset$
  };
};

const init = () => {
  const el = document.querySelector('div');
  const { drag$, reset$ } = getObservables(el);
  drag$.subscribe(e => console.log('drag', e));
  reset$.subscribe(e => console.log('reset', e));
};

document.addEventListener('DOMContentLoaded', init);
