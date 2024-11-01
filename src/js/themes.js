const themes = {
  1: 'prairie',
  2: 'desert',
  3: 'arctic',
  4: 'mountain',
};

// Функция для получения темы по номеру уровня
export function getTheme(level) {
  if (!Object.prototype.hasOwnProperty.call(themes, level)) {
    throw new Error(`Тема для уровня ${level} не найдена`);
  }
  return themes[level];
}

export default themes;
