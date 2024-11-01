/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const rowIndex = Math.floor(index / boardSize);
  const colIndex = index % boardSize;

  if (rowIndex === 0) {
    return colIndex === 0 ? 'top-left' : colIndex === boardSize - 1 ? 'top-right' : 'top';
  }

  if (rowIndex === boardSize - 1) {
    return colIndex === 0 ? 'bottom-left' : colIndex === boardSize - 1 ? 'bottom-right' : 'bottom';
  }

  if (colIndex === 0) {
    return 'left';
  }

  if (colIndex === boardSize - 1) {
    return 'right';
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
