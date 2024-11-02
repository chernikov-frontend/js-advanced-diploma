import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Bowman from './characters/Bowman';
import Vampire from './characters/Vampire';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';

// Функция для расчета, находится ли целевая позиция в пределах заданного радиуса от текущей позиции
function isWithinRadius(currentPos, targetPos, radius) {
    const x1 = currentPos % 8;
    const y1 = Math.floor(currentPos / 8);
    const x2 = targetPos % 8;
    const y2 = Math.floor(targetPos / 8);
    const distance = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)); // Расстояние по радиусу
    return distance <= radius;
}

// Функция для получения максимального радиуса перемещения для каждого класса персонажа
function getMaxMoveRange(character) {
    switch (character.constructor) {
        case Swordsman:
        case Undead:
        return 4;
        case Bowman:
        case Vampire:
        return 2;
        case Magician:
        case Daemon:
        return 1;
        default:
        return 1;
    }
}

// Функция для получения максимального радиуса атаки для каждого класса персонажа
function getAttackRange(character) {
    switch (character.constructor) {
        case Swordsman:
        case Undead:
        return 1;
        case Bowman:
        case Vampire:
        return 2;
        case Magician:
        case Daemon:
        return 4;
        default:
        return 1;
    }
}

// Проверка допустимости перемещения, учитывая радиус перемещения
export function isMoveAllowed(character, currentPos, targetPos) {
    const moveRadius = getMaxMoveRange(character);
    return isWithinRadius(currentPos, targetPos, moveRadius);
}

// Проверка допустимости атаки, учитывая радиус атаки
export function isAttackAllowed(character, currentPos, targetPos) {
    const attackRadius = getAttackRange(character);
    return isWithinRadius(currentPos, targetPos, attackRadius);
}
