import { fromEvent, merge } from 'rxjs';
import { takeUntil, map, switchMap } from 'rxjs/operators';

const getMouseObservables = (el, nav) => {
  return [
    {
      target: el,
      event: 'mousedown'
    },
    {
      target: el,
      event: 'mousemove'
    },
    {
      target: nav,
      event: 'mouseup'
    }
  ].map(({ target, event }) => {
    return fromEvent(target, event).pipe(
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
        return {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      })
    );
  });
};

const getObservables = (el, nav, pages) => {
  const [mousedown$, mousemove$, mouseup$] = getMouseObservables(el, nav);

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
            dx: (m.x - startingX) / width,
            dy: (m.y - startingY) / height
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
          };
        })
      );
    })
  );
  const pageClicks = pages.map(({ page }) => fromEvent(page, 'click'));
  const dismiss$ = merge(...pageClicks);
  return {
    drag$,
    reset$,
    dismiss$
  };
};

export {
  getObservables
}