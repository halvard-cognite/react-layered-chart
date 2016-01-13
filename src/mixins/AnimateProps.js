import _ from 'lodash';
import d3Interpolate from 'd3-interpolate';
import d3Ease from 'd3-ease';

import wrapAndDelegateAfter from './wrapAndDelegateAfter';

const ANIMATION_FRAMERATE = 30;

function animateOnce(fromValue, toValue, durationMs, onFrame) {
  const interpolator = d3Interpolate.value(fromValue, toValue);
  const frameCount = Math.ceil(durationMs / 1000 * ANIMATION_FRAMERATE);

  let frame = 1;
  const setIntervalId = setInterval(() => {
    onFrame(interpolator(d3Ease.cubicInOut(frame / frameCount)));
    if (frame === frameCount) {
      clearInterval(setIntervalId);
    }
    frame++;
  }, durationMs / frameCount);

  return () => { clearInterval(setIntervalId); };
}

export default function AnimateProps(component) {
  wrapAndDelegateAfter(component, 'componentWillMount', function() {
    if (!_.isPlainObject(this.animatedProps)) {
      throw new Error(this.constructor.name + ' must have an animatedProps field to use the AnimateProps decorator');
    }

    this.__animatingPropCancelCallbacks = {};
    _.each(this.animatedProps, (durationMs, propName) => {
      this.setState({
        [`animated-${propName}`]: this.props[propName]
      });
    });
  });

  wrapAndDelegateAfter(component, 'componentWillReceiveProps', function(nextProps) {
    _.each(this.animatedProps, (durationMs, propName) => {
      if (this.props[propName] !== nextProps[propName]) {
        if (durationMs > 0) {
          if (this.__animatingPropCancelCallbacks[propName]) {
            this.__animatingPropCancelCallbacks[propName]();
          }
          this.__animatingPropCancelCallbacks[propName] = animateOnce(this.props[propName], nextProps[propName], durationMs, v => {
            this.setState({
              [`animated-${propName}`]: _.clone(v)
            });
          });
        } else {
          this.setState({
            [`animated-${propName}`]: nextProps[propName]
          });
        }
      }
    });
  });
}