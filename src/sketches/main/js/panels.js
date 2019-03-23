import clamp from '../../../util/clamp';

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

export {
  deltaToScales,
  resetStep
}