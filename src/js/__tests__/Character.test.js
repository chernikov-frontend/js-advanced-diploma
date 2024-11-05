import GamePlay from '../GamePlay';
import GameController from '../GameController';
import Character from '../Character';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Bowman from '../characters/Bowman';
import Vampire from '../characters/Vampire';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';

const mockCharacter = {
    level: 3,
    attack: 40,
    defence: 10,
    health: 100,
};

const expectedTooltip = '🎖 3 ⚔ 40 🛡 10 ❤ 100';

describe('Тесты для класса Character', () => {
    test('нельзя создавать объект базового класса Character', () => {
        expect(() => new Character(1)).toThrow("Нельзя создавать экземпляры класса Character напрямую.");
    });

    test('проверка свойств класса Bowman', () => {
        const bowman = new Bowman(1);
        expect(bowman.level).toBe(1);
        expect(bowman.attack).toBe(25);
        expect(bowman.defence).toBe(25);
    });
});

describe('проверки характеристик персонажей', () => {
    let gameController;

    beforeEach(() => { 
        // Инициализируем GameController с мок-объектом GamePlay
        gameController = new GameController(new GamePlay(), {});
    });

    test('должен корректно формировать строку с характеристиками персонажа', () => {
        const tooltip = gameController.createCharacterTooltip(mockCharacter);
        expect(tooltip).toBe(expectedTooltip);
    });

    const characterTestCases = [
        { CharacterClass: Swordsman, name: 'Мечник', expectedMoveRange: 4, expectedAttackRange: 1 },
        { CharacterClass: Undead, name: 'Скелет', expectedMoveRange: 4, expectedAttackRange: 1 },
        { CharacterClass: Bowman, name: 'Лучник', expectedMoveRange: 2, expectedAttackRange: 2 },
        { CharacterClass: Vampire, name: 'Вампир', expectedMoveRange: 2, expectedAttackRange: 2 },
        { CharacterClass: Magician, name: 'Маг', expectedMoveRange: 1, expectedAttackRange: 4 },
        { CharacterClass: Daemon, name: 'Демон', expectedMoveRange: 1, expectedAttackRange: 4 },
    ];

    test.each(characterTestCases)(
        '$name имеет радиус движения $expectedMoveRange и радиус атаки $expectedAttackRange',
        ({ CharacterClass, expectedMoveRange, expectedAttackRange }) => {
            const character = new CharacterClass(1);
            expect(gameController.getMoveRange(character)).toBe(expectedMoveRange);
            expect(gameController.getAttackRange(character)).toBe(expectedAttackRange);
        }
    );

    test.each(characterTestCases)(
        '$name может атаковать и двигаться в пределах допустимого диапазона',
        ({ CharacterClass }) => {
            const character = new CharacterClass(1);
            const moveRange = gameController.getMoveRange(character);
            const attackRange = gameController.getAttackRange(character);
            const position = 27; // произвольная позиция на доске

            const allowedMoves = gameController.calcRange(position, moveRange);
            const allowedAttacks = gameController.calcRange(position, attackRange);

            expect(allowedMoves.length).toBeGreaterThan(0);
            expect(allowedAttacks.length).toBeGreaterThan(0);
        }
    );
});
