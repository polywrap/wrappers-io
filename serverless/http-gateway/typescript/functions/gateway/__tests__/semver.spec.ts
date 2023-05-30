import { verify, getLatest, sortVersions } from "../src/semver";

describe('Semantic Versioning functions', () => {
    const versionObjects = [
        { name: '1.0.0' },
        { name: '1.1.0' },
        { name: '1.2.0' },
        { name: '2.0.0' },
        { name: '2.1.0' },
        { name: '2.1.1' },
    ];

    test('verify function should return true for valid versions and false for invalid versions', () => {
        expect(verify({ name: '1.2.3' })).toBeTruthy();
        expect(verify({ name: '1.2.3-alpha' })).toBeTruthy();
        expect(verify({ name: '1.2' })).toBeFalsy();
        expect(verify({ name: '1.2.3-alpha.1' })).toBeTruthy();
        expect(verify({ name: 'a.b.c' })).toBeFalsy();
    });

    test('getLatest function should return the latest version object for a given version prefix', () => {
        expect(getLatest('1', versionObjects)).toEqual({ name: '1.2.0' });
        expect(getLatest('2.1', versionObjects)).toEqual({ name: '2.1.1' });
        expect(getLatest('3', versionObjects)).toBeNull();
    });

    test('sortVersions function should return an array of version objects sorted in ascending order', () => {
        const unordered = [
            { name: '1.0.0' },
            { name: '2.0.0' },
            { name: '1.2.0' },
            { name: '2.1.0' },
            { name: '1.1.0' },
            { name: '2.1.1' },
        ];
        const sorted = [
            { name: '1.0.0' },
            { name: '1.1.0' },
            { name: '1.2.0' },
            { name: '2.0.0' },
            { name: '2.1.0' },
            { name: '2.1.1' },
        ];
        expect(sortVersions(unordered)).toEqual(sorted);
    });
});