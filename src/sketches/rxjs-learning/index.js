// import * as Rx from 'rxjs';
import { fromEvent, merge } from 'rxjs';
import { takeUntil, mergeMap, map, switchMap } from 'rxjs/operators';

const init = () => {
  // console.log({fromEvent, takeUntil, mergeMap});
  const el = document.querySelector('div');

  const mousedown$ = fromEvent(el, 'mousedown').pipe(
    map(e => ({
      x: e.clientX,
      y: e.clientY
    }))
  );
  const mousemove$ = fromEvent(el, 'mousemove').pipe(
    map(e => ({ x: e.clientX, y: e.clientY }))
  );
  const mouseup$ = fromEvent(el, 'mouseup');

  const touchstart$ = fromEvent(el, 'touchstart').pipe(
    map(e => ({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }))
  );
  const touchmove$ = fromEvent(el, 'touchmove').pipe(
    map(e => ({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }))
  );
  const touchend$ = fromEvent(el, 'touchend');

  const start$ = merge(mousedown$, touchstart$);
  const move$ = merge(mousemove$, touchmove$);
  const end$ = merge(mouseup$, touchend$);

  // This works and is good to reference
  // const pull$ = mousedown$.pipe(
  //   mergeMap(down => mousemove$.pipe(
  //     takeUntil(mouseup$)
  //   ))
  // );
  // pull$.subscribe(e => {
  //   console.log(e);
  // })

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
  drag$.subscribe(e => console.log(e));
};

document.addEventListener('DOMContentLoaded', init);
