import { isMoveAllowed, isAttackAllowed } from '../characterUtils';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Bowman from '../characters/Bowman';
import Vampire from '../characters/Vampire';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';

describe('Тесты на перемещение персонажей', () => {
    test('Swordsman может двигаться на 4 клетки', () => {
        const swordsman = new Swordsman(1);
        expect(isMoveAllowed(swordsman, 0, 4)).toBeTruthy();
        expect(isMoveAllowed(swordsman, 0, 5)).toBeFalsy();
    });

    test('Undead может двигаться на 4 клетки', () => {
        const undead = new Undead(1);
        expect(isMoveAllowed(undead, 0, 4)).toBeTruthy();
        expect(isMoveAllowed(undead, 0, 5)).toBeFalsy();
    });

    test('Bowman может двигаться на 2 клетки', () => {
        const bowman = new Bowman(1);
        expect(isMoveAllowed(bowman, 0, 2)).toBeTruthy();
        expect(isMoveAllowed(bowman, 0, 3)).toBeFalsy();
    });

    test('Vampire может двигаться на 2 клетки', () => {
        const vampire = new Vampire(1);
        expect(isMoveAllowed(vampire, 0, 2)).toBeTruthy();
        expect(isMoveAllowed(vampire, 0, 3)).toBeFalsy();
    });

    test('Magician может двигаться на 1 клетку', () => {
        const magician = new Magician(1);
        expect(isMoveAllowed(magician, 0, 1)).toBeTruthy();
        expect(isMoveAllowed(magician, 0, 2)).toBeFalsy();
    });

    test('Daemon может двигаться на 1 клетку', () => {
        const daemon = new Daemon(1);
        expect(isMoveAllowed(daemon, 0, 1)).toBeTruthy();
        expect(isMoveAllowed(daemon, 0, 2)).toBeFalsy();
    });
});

describe('Тесты на атаку персонажей', () => {
    test('Swordsman может атаковать на 1 клетку', () => {
        const swordsman = new Swordsman(1);
        expect(isAttackAllowed(swordsman, 0, 1)).toBeTruthy();
        expect(isAttackAllowed(swordsman, 0, 2)).toBeFalsy();
    });

    test('Undead может атаковать на 1 клетку', () => {
        const undead = new Undead(1);
        expect(isAttackAllowed(undead, 0, 1)).toBeTruthy();
        expect(isAttackAllowed(undead, 0, 2)).toBeFalsy();
    });

    test('Bowman может атаковать на 2 клетки', () => {
        const bowman = new Bowman(1);
        expect(isAttackAllowed(bowman, 0, 2)).toBeTruthy();
        expect(isAttackAllowed(bowman, 0, 3)).toBeFalsy();
    });

    test('Vampire может атаковать на 2 клетки', () => {
        const vampire = new Vampire(1);
        expect(isAttackAllowed(vampire, 0, 2)).toBeTruthy();
        expect(isAttackAllowed(vampire, 0, 3)).toBeFalsy();
    });

    test('Magician может атаковать на 4 клетки', () => {
        const magician = new Magician(1);
        expect(isAttackAllowed(magician, 0, 4)).toBeTruthy();
        expect(isAttackAllowed(magician, 0, 5)).toBeFalsy();
    });

    test('Daemon может атаковать на 4 клетки', () => {
        const daemon = new Daemon(1);
        expect(isAttackAllowed(daemon, 0, 4)).toBeTruthy();
        expect(isAttackAllowed(daemon, 0, 5)).toBeFalsy();
    });
});
