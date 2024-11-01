import { calcTileType } from '../utils';

describe('calcTileType', () => {
    it('возвращает top-left для первого элемента', () => {
        expect(calcTileType(0, 8)).toBe('top-left');
    });

    it('возвращает top для второго элемента в первой строке', () => {
        expect(calcTileType(1, 8)).toBe('top');
    });

    it('возвращает top для элемента посередине первой строки', () => {
        expect(calcTileType(5, 8)).toBe('top');
    });

    it('возвращает top-right для последнего элемента в первой строке', () => {
        expect(calcTileType(7, 8)).toBe('top-right');
    });

    it('возвращает left для элемента в первом столбце', () => {
        expect(calcTileType(16, 8)).toBe('left');
    });

    it('возвращает right для элемента в последнем столбце', () => {
        expect(calcTileType(31, 8)).toBe('right');
    });

    it('возвращает bottom-left для первого элемента в последней строке', () => {
        expect(calcTileType(56, 8)).toBe('bottom-left');
    });

    it('возвращает bottom для элемента посередине последней строки', () => {
        expect(calcTileType(58, 8)).toBe('bottom');
    });

    it('возвращает bottom-right для последнего элемента', () => {
        expect(calcTileType(63, 8)).toBe('bottom-right');
    });

    it('возвращает center для элемента внутри доски', () => {
        expect(calcTileType(27, 8)).toBe('center');
    });
});