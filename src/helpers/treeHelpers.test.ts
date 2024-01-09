import { buildTree } from './treeHelpers';

describe('buildTree', () => {
    it('builds a simple tree', () => {
        const connections = [['a', 'b'], ['a', 'c']];
        expect(buildTree(connections)).toEqual({ a: { b: {}, c: {} } });
    });

    it('builds a multi-level tree', () => {
        const connections = [['a', 'b'], ['b', 'c']];
        expect(buildTree(connections)).toEqual({ a: { b: { c: {} } } });
    });

    it('handles empty connections', () => {
        expect(buildTree([])).toEqual({});
    });

    it('handles duplicate connections', () => {
        const connections = [['a', 'b'], ['a', 'b']];
        expect(buildTree(connections)).toEqual({ a: { b: {} } });
    });
});

// TODO: extend with error detection (ex. circular detection, more than one tree)
