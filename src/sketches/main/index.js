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
  ];
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
  root.addEventListener('touchstart', e => {
    START_X = e.touches[0].clientX / root.clientWidth;
    START_Y = e.touches[0].clientY / root.clientHeight;
  });
  root.addEventListener('touchmove', (e) =>{
    const deltaX = (e.touches[0].clientX / root.clientWidth) - START_X;
    const deltaY = (e.touches[0].clientY / root.clientHeight) - START_Y;
    
    const scales = deltaToScales(deltaX, deltaY);
    scales.forEach((scale, index) => {
      panels[index].outer.style.transform = `scale(${scale})`;
    })

    // const positions = pointToPositions({x, y});
    // const scales = positions.map(pointToScales);
    // console.log(scales);
    // scales.forEach(({ scale, inverseScale }, index) => {
    //   panels[index].outer.style.transform = `scale(${scale})`;
    //   // panels[index].inner.style.transform = `scale(${inverseScale})`;
    // });
  });
  root.addEventListener('touchend', e => {
    //reset to origin
  });
};

document.addEventListener('DOMContentLoaded', init);