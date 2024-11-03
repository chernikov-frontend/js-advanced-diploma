import GameController from '../GameController';
import GamePlay from '../GamePlay';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Bowman from '../characters/Bowman';
import Vampire from '../characters/Vampire';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';

// Мок для gamePlay
jest.mock('../GamePlay');


const mockCharacter = {
    level: 3,
    attack: 40,
    defence: 10,
    health: 100,
};

const expectedTooltip = '🎖 3 ⚔ 40 🛡 10 ❤ 100';

describe('GameController createCharacterTooltip', () => {
    let gameController;

    beforeEach(() => {
        // Инициализируем GameController с мок-объектом GamePlay
        gameController = new GameController(new GamePlay());
    });

    test('должен корректно формировать строку с характеристиками персонажа', () => {
        const tooltip = gameController.createCharacterTooltip(mockCharacter);
        expect(tooltip).toBe(expectedTooltip);
    });
});

describe('GameController - проверка радиуса атаки и движения для каждого класса персонажей', () => {
    let gameController;

    beforeEach(() => {
        gameController = new GameController(new GamePlay());
    });

    test('Swordsman имеет радиус движения 4 и радиус атаки 1', () => {
        const swordsman = new Swordsman(1);
        expect(gameController.getMoveRange(swordsman)).toBe(4);
        expect(gameController.getAttackRange(swordsman)).toBe(1);
    });

    test('Undead имеет радиус движения 4 и радиус атаки 1', () => {
        const undead = new Undead(1);
        expect(gameController.getMoveRange(undead)).toBe(4);
        expect(gameController.getAttackRange(undead)).toBe(1);
    });

    test('Bowman имеет радиус движения 2 и радиус атаки 2', () => {
        const bowman = new Bowman(1);
        expect(gameController.getMoveRange(bowman)).toBe(2);
        expect(gameController.getAttackRange(bowman)).toBe(2);
    });

    test('Vampire имеет радиус движения 2 и радиус атаки 2', () => {
        const vampire = new Vampire(1);
        expect(gameController.getMoveRange(vampire)).toBe(2);
        expect(gameController.getAttackRange(vampire)).toBe(2);
    });

    test('Magician имеет радиус движения 1 и радиус атаки 4', () => {
        const magician = new Magician(1);
        expect(gameController.getMoveRange(magician)).toBe(1);
        expect(gameController.getAttackRange(magician)).toBe(4);
    });

    test('Daemon имеет радиус движения 1 и радиус атаки 4', () => {
        const daemon = new Daemon(1);
        expect(gameController.getMoveRange(daemon)).toBe(1);
        expect(gameController.getAttackRange(daemon)).toBe(4);
    });
});
