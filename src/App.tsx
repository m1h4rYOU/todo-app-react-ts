import React from 'react';
// import './App.css';

const items = ['あああ','いいい','ううう']

const App = (): React.ReactElement => {
  return(
    <>
    <input type="placeholder" placeholder='ToDoを入力' />
    <button>追加</button>

    <p>未完了のToDo</p>
    <ul>
      {items.map((todo)=>
        <li>{todo}
          <button type='button'>完了</button>
          <button type='button'>削除</button>
        </li>
      )}
    </ul>

    <p>完了済みのToDo</p>
    <ul>
      <li>
        <button type='button'>未完了へ戻す</button>
        <button type='button'>削除</button>
      </li>
    </ul>
    
    <p>削除済みのToDo</p>
    <ul>
      <li>
        <button type='button'>完了へ戻す</button>
        <button type='button'>未完了へ戻す</button>
        <button type='button'>完全に削除</button>
      </li>
    </ul>
    </>
  );

}

export default App;
