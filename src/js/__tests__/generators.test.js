import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';

test('генератор characterGenerator возвращает случайные объекты', () => {
    const generator = characterGenerator([Bowman], 2);
    const character1 = generator.next().value;
    const character2 = generator.next().value;
    expect(character1).toBeInstanceOf(Bowman);
    expect(character2).toBeInstanceOf(Bowman);
    expect(character1.level).toBeGreaterThanOrEqual(1);
    expect(character1.level).toBeLessThanOrEqual(2);
});

test('generateTeam создает команду с заданным количеством персонажей', () => {
    const team = generateTeam([Bowman], 1, 3);
    expect(team.characters.length).toBe(3);
    expect(team.characters[0]).toBeInstanceOf(Bowman);
});