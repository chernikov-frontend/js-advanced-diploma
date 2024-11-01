export default class GameState {
  constructor() {
    this.currentTurn = 'player'; // Изначально ход у игрока
  }

  // Метод для переключения хода
  switchTurn() {
    this.currentTurn = this.currentTurn === 'player' ? 'computer' : 'player';
  }

  // Восстановление состояния из объекта
  static from(object) {
    const gameState = new GameState();
    gameState.currentTurn = object?.currentTurn || 'player';
    return gameState;
  }
}
