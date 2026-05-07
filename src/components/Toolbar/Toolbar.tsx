import { useState } from "react";

interface Props {
  onAddVariable: (name: string) => void;
  onAddOperation: (name: string) => void;
  onAddFunction: (name: string) => void;
  loadTemplate: () => void;
  saveGraph: () => void;
  loadSavedGraph: () => void;
}

export default function Toolbar({
  onAddVariable,
  onAddOperation,
  onAddFunction,
  loadTemplate,
  saveGraph,
  loadSavedGraph,
}: Props) {
  const [varName, setVarName] = useState("");
  const [opName, setOpName] = useState("");
  const [funcName, setFuncName] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="toolbar">
      <input
        value={varName}
        onChange={(e) => setVarName(e.target.value)}
        placeholder="Имя переменной"
      />
      <button
        onClick={() => {
          const trimmed = varName.trim();
          if (!trimmed) return;
          onAddVariable(trimmed);
          setVarName("");
        }}
      >
        Добавить
      </button>

      <input
        value={opName}
        onChange={(e) => setOpName(e.target.value)}
        placeholder="Имя бинарной операции"
      />
      <button
        onClick={() => {
          const trimmed = opName.trim();
          if (!trimmed) return;
          onAddOperation(trimmed);
          setOpName("");
        }}
      >
        Добавить
      </button>

      <input
        value={funcName}
        onChange={(e) => setFuncName(e.target.value)}
        placeholder="Имя функции"
      />

      <button
        onClick={() => {
          const trimmed = funcName.trim();
          if (!trimmed) return;
          onAddFunction(trimmed);
          setFuncName("");
        }}
      >
        Добавить
      </button>

      <button onClick={saveGraph}>💾 Сохранить</button>
      <button onClick={loadSavedGraph}>📁 Загрузить</button>
      <button onClick={loadTemplate}>Демо</button>
      <button onClick={() => setShowHelp(true)}>Справка</button>

      {showHelp && (
        <div className="help-overlay">
          <div className="help-modal">
            <button className="help-close" onClick={() => setShowHelp(false)}>
              ✕
            </button>

            <div className="help-content">
              <h3>1. Назначение программы</h3>

              <p>
                Программа предназначена для построения вычислительных схем,
                вычисления математических выражений, поиска зависимостей между
                переменными и построения графиков функций.
              </p>

              <p>Основной принцип работы:</p>

              <ol>
                <li>Создать схему из блоков.</li>
                <li>Соединить блоки между собой.</li>
                <li>Задать значения переменных.</li>
                <li>Выбрать исходную и искомую переменную.</li>
                <li>Получить формулу и график зависимости.</li>
              </ol>

              <h3>2. Основные элементы</h3>

              <p>В верхней панели доступны следующие элементы:</p>

              <ul>
                <li>Переменная</li>
                <li>Бинарная операция</li>
                <li>Математическая функция</li>
              </ul>

              <h3>3. Поддерживаемые операции</h3>

              <ul>
                <li>add — сложение</li>
                <li>sub — вычитание</li>
                <li>mul — умножение</li>
                <li>div — деление</li>
              </ul>

              <h3>4. Поддерживаемые функции</h3>

              <ul>
                <li>sin — синус</li>
                <li>cos — косинус</li>
                <li>tan — тангенс</li>
                <li>ln — натуральный логарифм</li>
                <li>log — логарифм (можно задавать)</li>
                <li>exp — экспонента</li>
                <li>abs — модуль</li>
                <li>pow — степень (можно задавать)</li>
                <li>root — корень (можно задавать)</li>
                <li>one — функция Хевисайда (единичная)</li>
                <li>sign — сигнум (знак числа)</li>
              </ul>

              <h3>5. Рабочая область</h3>

              <p>
                Центральная часть интерфейса представляет собой полотно
                построения схемы.
              </p>

              <p>На полотне можно:</p>

              <ul>
                <li>перемещать блоки;</li>
                <li>соединять элементы;</li>
                <li>масштабировать область;</li>
                <li>перемещать рабочее пространство.</li>
              </ul>

              <h3>6. Построение зависимостей</h3>

              <p>
                В разделе «Исходное (Ось X)» выбирается независимая переменная,
                а в разделе «Найти (Ось Y)» — вычисляемая зависимость.
              </p>

              <p>Примеры:</p>

              <ul>
                <li>X → F — прямая зависимость</li>
                <li>F → X — обратная зависимость</li>
              </ul>

              <h3>7. Вычисления</h3>

              <p>Система выполняет:</p>

              <ul>
                <li>обход вычислительного графа;</li>
                <li>поиск зависимости между узлами;</li>
                <li>пошаговые вычисления;</li>
                <li>подстановку значений;</li>
                <li>построение итоговой формулы;</li>
                <li>построение графика.</li>
              </ul>

              <h3>8. Итоговая функция</h3>

              <p>Формулы отображаются в функциональном виде:</p>

              <ul>
                <li>add(a, b)</li>
                <li>sub(a, b)</li>
                <li>mul(a, b)</li>
                <li>div(a, b)</li>
              </ul>

              <p>
                Для сложных составных выражений система может отображать
                результат в символическом виде без полного алгебраического
                преобразования.
              </p>

              <h3>9. График функции</h3>

              <p>Для графика поддерживаются:</p>

              <ul>
                <li>масштабирование;</li>
                <li>перемещение области просмотра;</li>
                <li>отображение нескольких ветвей;</li>
                <li>отображение разрывов функции;</li>
                <li>просмотр координат точек.</li>
              </ul>

              <p>Управление графиком:</p>

              <ul>
                <li>колесо мыши — масштабирование;</li>
                <li>средняя кнопка мыши — перемещение;</li>
                <li>двойной клик — сброс масштаба.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
