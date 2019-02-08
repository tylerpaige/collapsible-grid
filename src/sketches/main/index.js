import './styles.scss';
import roundTo from '../../util/round-to';

const pointToPositions = ({ x, y }) => {
  const topLeftScale = [x, y];
  const topRightScale = [(1 - x), y];
  const bottomRightScale = [1 - x, (1 - y)];
  const bottomLeftScale = [x, (1 - y)];
  const inverseScales = [
    topLeftScale,
    topRightScale,
    bottomRightScale,
    bottomLeftScale
  ].map(s => {
    return s.map(p => 1 / p);
  });
  const [
    topLeftInverseScale,
    topRightInverseScale,
    bottomRightInverseScale,
    bottomLeftInverseScale
  ] = inverseScales;
  return [
    [
      topLeftScale,
      topLeftInverseScale
    ],
    [
      topRightScale,
      topRightInverseScale
    ],
    [
      bottomLeftScale,
      bottomLeftInverseScale
    ],
    [
      bottomRightScale,
      bottomRightInverseScale
    ]
  ]
};

const pointToScales = ([scaleArr, inverseScaleArr]) => {
  return {
    scale : scaleArr.map(s => roundTo(s, 4)).join(', '),
    inverseScale : inverseScaleArr.map(s => roundTo(s, 4)).join(', ')
  };
};

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
  });
  root.addEventListener('touchend', e => {
    clearTimeout(RESET_DELAY);
    root.classList.add('is-resetting');
    panels.forEach(({ inner, outer }) => {
      inner.style.transform = `scale(1)`;
      outer.style.transform = `scale(1)`;
    });
    setTimeout(() => {
      RESET_DELAY = root.classList.remove('is-resetting');
    }, 300);
  });
};

document.addEventListener('DOMContentLoaded', init);