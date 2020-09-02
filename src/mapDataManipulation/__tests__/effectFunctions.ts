import { runColorEffectFunction, runCustomEffectFunction } from '../effectFunctions';

test('apply color effect', () => {
  const originalPixel = [0.2, 0.8, 1, 1];
  const expectedPixel = [0, 1, 1, 1];
  const effects = {
    redRange: { from: 0.2, to: 0.8 },
    greenRange: { from: 0.2, to: 0.8 },
    blueRange: { from: 0.2, to: 0.8 },
  };
  const actualPixel = runColorEffectFunction(originalPixel, effects);
  expect(actualPixel).toEqual(expectedPixel);
});

test('custom effect - sum lower than 0.6, all are 0 ', () => {
  const originalPixel = [0.3, 0.1, 0.0, 1];
  const expectedPixel = [0, 0, 0, 1];
  const effects = {
    customEffect: ({ r, g, b, a }: { r: number; g: number; b: number; a: number }) => ({
      r: r + g + b < 0.6 ? 0 : 1,
      g: r + g + b < 0.6 ? 0 : 1,
      b: r + g + b < 0.6 ? 0 : 1,
      a: a,
    }),
  };
  const actualPixel = runCustomEffectFunction(originalPixel, effects);
  expect(actualPixel).toEqual(expectedPixel);
});

test('custom effect - sum higher than 0.6, all are 1', () => {
  const originalPixel = [0.3, 0.1, 0.8, 1];
  const expectedPixel = [1, 1, 1, 1];
  const effects = {
    customEffect: ({ r, g, b, a }: { r: number; g: number; b: number; a: number }) => ({
      r: r + g + b < 0.6 ? 0 : 1,
      g: r + g + b < 0.6 ? 0 : 1,
      b: r + g + b < 0.6 ? 0 : 1,
      a: a,
    }),
  };
  const actualPixel = runCustomEffectFunction(originalPixel, effects);
  expect(actualPixel).toEqual(expectedPixel);
});

test('custom effect - missing argument', () => {
  const originalPixel = [1, 1, 1, 1];
  const effects = {
    customEffect: ({ r, g, b }: { r: number; g: number; b: number }) => ({
      r: r,
      g: g,
      b: b,
    }),
  };

  expect(() => runCustomEffectFunction(originalPixel, effects)).toThrow(
    'Custom effect function must return an object with properties r, g, b, a.',
  );
});
