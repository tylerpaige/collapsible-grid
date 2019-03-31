import '../css/styles.scss';
import { getObservables } from './interactivity';
import * as navigation from './navigation';
import { deltaToScales, resetStep } from './panels';

const state = {
  quadrant: false
};

const init = () => {
  //Elements needed for interactivity
  const root = document.getElementById('root');
  const nav = document.querySelector('nav');
  const panels = Array.from(root.querySelectorAll('.panel')).map(outer => {
    const inner = outer.querySelector('.panel__inner');
    return {
      outer,
      inner
    };
  });
  const pages = Array.from(document.querySelectorAll('.page')).map(page => {
    const square = page.querySelector('.page__square');
    return {
      page,
      square
    };
  });

  //Event observers
  const { drag$, reset$, dismiss$, tabNavigation$ } = getObservables(root, nav, pages);

  //Event handlers
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
    const scales = deltaToScales(e.dx, e.dy);
    /*
    ---------
    | 1 | 2 |
    |---|---|
    | 3 | 4 |
    ---------
    */
    const quadrant = scales.findIndex(
      s => s.outer[0] >= 1.66 && s.outer[1] >= 1.66
    );
    if (quadrant >= 0) {
      navigation.goTo(state, quadrant + 1, pages[quadrant]);
      setTimeout(() => {
        resetStep(panels, e.dx, e.dy, descendingX, descendingY);
      }, 300);
    } else {
      resetStep(panels, e.dx, e.dy, descendingX, descendingY);
    }
  });
  dismiss$.subscribe(e => {
    navigation.closePage(state, pages);
  });


  tabNavigation$.subscribe(tabIndex => {
    navigation.goTo(state, tabIndex, pages[tabIndex - 1]);
  });
};

document.addEventListener('DOMContentLoaded', init);
