import { generateTeam, playerClasses, enemyClasses } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay) {
    this.gamePlay = gamePlay;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.playerTeam = generateTeam(playerClasses, 1, 2);
    this.enemyTeam = generateTeam(enemyClasses, 1, 2);
    this.positionCharacters();
  }

  positionCharacters() {
    const playerPositions = this.generatePositions([0, 1]);
    const enemyPositions = this.generatePositions([6, 7]);

    const positionedCharacters = [
      ...this.playerTeam.characters.map((character, index) => new PositionedCharacter(character, playerPositions[index])),
      ...this.enemyTeam.characters.map((character, index) => new PositionedCharacter(character, enemyPositions[index]))
    ];

    this.gamePlay.redrawPositions(positionedCharacters);
  }

  generatePositions(columns) {
    const positions = [];
    while (positions.length < 3) {
      const position = Math.floor(Math.random() * 8) * 8 + columns[Math.floor(Math.random() * columns.length)];
      if (!positions.includes(position)) {
        positions.push(position);
      }
    }
    return positions;
  }
  
  onCellEnter(index) { /* Реакция на наведение */ }
  onCellLeave(index) { /* Реакция на уход */ }
}













// import Bowman from './Characters/Bowman';
// import Swordsman from './Characters/Swordsman';
// import Magician from './Characters/Magician';
// import Vampire from './Characters/Vampire';
// import Undead from './Characters/Undead';
// import Daemon from './Characters/Daemon';
// import PositionedCharacter from './PositionedCharacter';
// // import GamePlay from './GamePlay';
// import { getTheme } from './themes';

// export default class GameController {
//   constructor(gamePlay, stateService) {
//     this.gamePlay = gamePlay;
//     this.stateService = stateService;

//     // Определяем массивы возможных позиций для команд
//     this.playerPositions = this.getColumnPositions([0, 1]);
//     this.enemyPositions = this.getColumnPositions([6, 7]);

//     // Инициализируем команды игроков и соперников
//     this.initTeams();
//   }

//   init() {
//     this.gamePlay.drawUi(getTheme(1));
//     this.gamePlay.redrawPositions(this.allPositions);

//     // Добавление обработчиков событий
//     this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
//     this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
//     this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

//     // Загрузка сохраненного состояния
//     const savedState = this.stateService.load();
//     if (savedState) {
//       // Обновление состояния игры
//     }
//   }

//   initTeams() {
//     // Создаем и позиционируем персонажей для игрока и соперника
//     this.playerCharacters = [
//       new Bowman(25),
//       new Swordsman(50),
//       new Magician(75)
//     ];
//     this.enemyCharacters = [
//       new Vampire(100),
//       new Undead(150),
//       new Daemon(200)
//     ];

//     this.positionedPlayerChars = this.assignPositions(this.playerCharacters, this.playerPositions);
//     this.positionedEnemyChars = this.assignPositions(this.enemyCharacters, this.enemyPositions);

//     // Объединяем всех персонажей для отрисовки
//     this.allPositions = [...this.positionedPlayerChars, ...this.positionedEnemyChars];
//   }

//   // Функция для получения позиций в указанных столбцах
//   getColumnPositions(columns) {
//     const positions = [];
//     for (let row = 0; row < 8; row++) {
//       columns.forEach(col => positions.push(row * 8 + col));
//     }
//     return positions;
//   }

//   // Назначает случайные позиции для каждого персонажа
//   assignPositions(characters, availablePositions) {
//     return characters.map(character => {
//       const randomIndex = Math.floor(Math.random() * availablePositions.length);
//       const position = availablePositions.splice(randomIndex, 1)[0];
//       return new PositionedCharacter(character, position);
//     });
//   }

//   onCellClick(index) {
//     const selectedChar = this.selectedCharacter;
//     if (selectedChar && this.canMoveTo(selectedChar, index)) {
//       this.moveCharacter(selectedChar, index);
//       this.gamePlay.redrawPositions(this.allPositions);
//     }
//   }

//   canMoveTo(character, index) {
//     return !this.allPositions.some(pos => pos.position === index);
//   }

//   moveCharacter(character, index) {
//     const positionedChar = this.allPositions.find(pos => pos.character === character);
//     if (positionedChar) {
//       positionedChar.position = index;
//     }
//   }

