import Swordsman from './characters/Swordsman';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';


export default class GameState {
  constructor() {
    this.currentTurn = 'player'; // Изначально ход у игрока
    this.currentLevel = 1;        // Изначально уровень 1
    this.positionedCharacters = []; // Позиции персонажей
    this.maxScore = 0;             // Максимальный счёт игры
  }

  // Метод для переключения хода
  switchTurn() {
    this.currentTurn = this.currentTurn === 'player' ? 'computer' : 'player';
  }

  // Метод преобразования в объект для сохранения
  toObject() {
    return {
      currentTurn: this.currentTurn,
      currentLevel: this.currentLevel,
      maxScore: this.maxScore,
      positionedCharacters: this.positionedCharacters.map(posChar => ({
        characterType: posChar.character.constructor.name,
        level: posChar.character.level,
        health: posChar.character.health,
        attack: posChar.character.attack,
        defence: posChar.character.defence,
        position: posChar.position,
      }))
    };
  }

  // Восстановление состояния из объекта
  static from(object) {
    const gameState = new GameState();
    gameState.currentTurn = object?.currentTurn || 'player';
    gameState.currentLevel = object?.currentLevel || 1;
    gameState.maxScore = object?.maxScore || 0;

    // Восстановление позиции персонажей из объекта
    if (object?.positionedCharacters) {
      gameState.positionedCharacters = object.positionedCharacters.map(charData => {
        let CharacterClass;
        switch (charData.characterType) {
          case 'Swordsman': CharacterClass = Swordsman; break;
          case 'Bowman': CharacterClass = Bowman; break;
          case 'Magician': CharacterClass = Magician; break;
          case 'Undead': CharacterClass = Undead; break;
          case 'Vampire': CharacterClass = Vampire; break;
          case 'Daemon': CharacterClass = Daemon; break;
          default: throw new Error('Неизвестный тип персонажа: ' + charData.characterType);
        }
        const character = new CharacterClass(charData.level);
        character.health = charData.health;
        character.attack = charData.attack;
        character.defence = charData.defence;
        return new PositionedCharacter(character, charData.position);
      });
    }

    return gameState;
  }
}
