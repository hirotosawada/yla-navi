export abstract class Transition {
  content: HTMLElement;
  abstract keyFrameDefault: { open: Keyframe; close: Keyframe };

  constructor(content: HTMLElement) {
    this.content = content;
  }

  protected getCurrentStyles(): Keyframe {
    const computedStyle = getComputedStyle(this.content);
    return {
      opacity: computedStyle.opacity,
      transform: computedStyle.transform || 'none',
      height: computedStyle.height,
    };
  }

  protected decomposeMatrix(matrix: string): {
    angle: number;
    scaleX: number;
    scaleY: number;
    translateX: number;
    translateY: number;
  } {
    const values =
      matrix
        .match(/matrix\(([^)]+)\)/)?.[1]
        .split(',')
        .map(parseFloat) || [];

    // matrix(a, b, c, d, e, f) の順
    const [a, b, c, d, e, f] = values;

    // 回転 (θ)
    const angle = Math.atan2(b, a); // atan2(b, a) で回転角を取得

    // スケーリング
    const scaleX = Math.sqrt(a * a + b * b); // X軸方向のスケーリング
    const scaleY = Math.sqrt(c * c + d * d); // Y軸方向のスケーリング

    // 平行移動
    const translateX = e;
    const translateY = f;

    return {
      angle: angle, // 回転角度 (ラジアン)
      scaleX: scaleX, // X軸方向のスケーリング
      scaleY: scaleY, // Y軸方向のスケーリング
      translateX: translateX, // X軸方向の移動
      translateY: translateY, // Y軸方向の移動
    };
  }

  abstract getKeyframesOpen(): Keyframe[];
  abstract getKeyframesClose(): Keyframe[];

  beforeOpen() {}
  afterOpen() {}
  beforeClose() {}
  afterClose() {}
}

// ========== ========== ========== ========== ==========

export class FadeTransition extends Transition {
  keyFrameDefault = { open: { opacity: '1' }, close: { opacity: 0 } };

  getKeyframesOpen(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.close;
    if (Number(currentStyle.opacity) > 0 && Number(currentStyle.opacity) < 1) {
      keyframe = { opacity: currentStyle.opacity };
    }

    return [keyframe, this.keyFrameDefault.open];
  }

  getKeyframesClose(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.open;
    if (Number(currentStyle.opacity) > 0 && Number(currentStyle.opacity) < 1) {
      keyframe = { opacity: currentStyle.opacity };
    }

    return [keyframe, this.keyFrameDefault.close];
  }
}

export class FoldingTransition extends Transition {
  keyFrameDefault = { open: { height: 'auto' }, close: { height: '0px' } };
  // keyFrameDefault = { open: { height: 'auto', opacity: 1 }, close: { height: '0px', opacity: 0 } };

  getKeyframesOpen(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.close;

    const firstChild = this.content.firstElementChild as HTMLElement;
    const heightInner = firstChild ? firstChild.scrollHeight : this.content.scrollHeight;

    if (parseInt(currentStyle.height) > 0 && parseInt(currentStyle.height) < heightInner) {
      keyframe = { height: currentStyle.height };
      // keyframe = { height: currentStyle.height, opacity: 0 };
    }

    return [keyframe, { height: `${heightInner}px` }];
    // return [keyframe, { height: `${heightInner}px`, opacity: 1 }];
    // return [];
  }

  getKeyframesClose(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.open;

    // const firstChild = this.content.firstElementChild as HTMLElement;
    // const heightInner = firstChild ? firstChild.scrollHeight : this.content.scrollHeight;

    keyframe = { height: currentStyle.height };
    // keyframe = { height: currentStyle.height, opacity: 1 };
    // if (parseInt(currentStyle.height) > 0) {
    // }

    // console.log(currentStyle.height);

    return [keyframe, this.keyFrameDefault.close];
    // return [];
  }

  beforeOpen() {
    this.content.style.overflow = 'hidden';
  }
  afterOpen() {
    this.content.style.overflow = '';
    // this.content.style.height = 'auto';

    // this.content.style.opacity = '1';
    // this.content.style.animation = 'none';
  }

  beforeClose() {
    this.content.style.overflow = 'hidden';
  }
  afterClose() {
    this.content.style.overflow = '';
    // this.content.style.height = 'auto';

    // this.content.style.opacity = '1';
  }
}
export class SlideTopTransition extends Transition {
  keyFrameDefault = { open: { transform: 'none' }, close: { transform: 'translateY(-100%)' } };

  getKeyframesOpen(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.close;

    const translateY = this.decomposeMatrix(currentStyle.transform).translateY;
    if (translateY && translateY < 0) {
      keyframe = { translateY: `${translateY}px` };
    }

    // console.log(this.decomposeMatrix(currentStyle.transform));

    return [keyframe, this.keyFrameDefault.open];
  }

  getKeyframesClose(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.open;

    const translateY = this.decomposeMatrix(currentStyle.transform).translateY;
    if (translateY && translateY < 0) {
      keyframe = { translateY: `${translateY}px` };
    }

    return [keyframe, this.keyFrameDefault.close];
  }
}
export class SlideBottomTransition extends Transition {
  keyFrameDefault = { open: { transform: 'none' }, close: { transform: 'translateY(100%)' } };

  getKeyframesOpen(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.close;

    const translateY = this.decomposeMatrix(currentStyle.transform).translateY;
    if (translateY && translateY > 0) {
      keyframe = { transform: `translatYX(${translateY}px)` };
    }

    return [keyframe, this.keyFrameDefault.open];
  }

  getKeyframesClose(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.open;

    const translateY = this.decomposeMatrix(currentStyle.transform).translateY;
    if (translateY && translateY > 0) {
      keyframe = { transform: `translatYX(${translateY}px)` };
    }

    return [keyframe, this.keyFrameDefault.close];
  }
}
export class SlideLeftTransition extends Transition {
  keyFrameDefault = { open: { transform: 'none' }, close: { transform: 'translateX(-100%)' } };

  getKeyframesOpen(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.close;

    const translateX = this.decomposeMatrix(currentStyle.transform).translateX;
    if (translateX && translateX < 0) {
      keyframe = { transform: `translateX(${translateX}px)` };
    }

    return [keyframe, this.keyFrameDefault.open];
  }

  getKeyframesClose(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.open;

    const translateX = this.decomposeMatrix(currentStyle.transform).translateX;
    if (translateX && translateX < 0) {
      keyframe = { transform: `translateX(${translateX}px)` };
    }

    return [keyframe, this.keyFrameDefault.close];
  }
}
export class SlideRightTransition extends Transition {
  keyFrameDefault = { open: { transform: 'none' }, close: { transform: 'translateX(100%)' } };

  getKeyframesOpen(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.close;

    const translateX = this.decomposeMatrix(currentStyle.transform).translateX;
    if (translateX && translateX > 0) {
      keyframe = { transform: `translateX(${translateX}px)` };
    }

    return [keyframe, this.keyFrameDefault.open];
  }

  getKeyframesClose(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.open;

    const translateX = this.decomposeMatrix(currentStyle.transform).translateX;
    if (translateX && translateX > 0) {
      keyframe = { transform: `translateX(${translateX}px)` };
    }

    return [keyframe, this.keyFrameDefault.close];
  }
}

export class FadeFoldingTransition extends Transition {
  keyFrameDefault = { open: { height: 'auto', opacity: 1 }, close: { height: '0px', opacity: 0 } };

  getKeyframesOpen(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.close;

    const firstChild = this.content.firstElementChild as HTMLElement;
    const heightInner = firstChild ? firstChild.scrollHeight : this.content.scrollHeight;

    if (parseInt(currentStyle.height) > 0 && parseInt(currentStyle.height) < heightInner) {
      keyframe = { height: currentStyle.height, opacity: currentStyle.opacity };
    }

    return [keyframe, { height: `${heightInner}px`, opacity: 1 }];
  }

  getKeyframesClose(): Keyframe[] {
    const currentStyle = getComputedStyle(this.content);
    let keyframe: Keyframe = this.keyFrameDefault.open;

    keyframe = { height: currentStyle.height, opacity: currentStyle.opacity  };

    return [keyframe, this.keyFrameDefault.close];
  }

  beforeOpen() {
    this.content.style.overflow = 'hidden';
  }
  afterOpen() {
    this.content.style.overflow = '';
  }

  beforeClose() {
    this.content.style.overflow = 'hidden';
  }
  afterClose() {
    this.content.style.overflow = '';

  }
}