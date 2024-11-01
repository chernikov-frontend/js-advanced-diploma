import Character from '../Character';
import Bowman from '../characters/Bowman';

test('нельзя создавать объект базового класса Character', () => {
    expect(() => new Character(1)).toThrow("Нельзя создавать экземпляры класса Character напрямую.");
});

test('проверка свойств класса Bowman', () => {
    const bowman = new Bowman(1);
    expect(bowman.level).toBe(1);
    expect(bowman.attack).toBe(25);
    expect(bowman.defence).toBe(25);
});